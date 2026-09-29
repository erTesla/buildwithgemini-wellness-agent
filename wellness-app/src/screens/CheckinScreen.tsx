import React, { useState } from 'react';
import { WellnessCheckIn, MoodType, UserPreferences, HobbyItem } from '../types';
import { analyzeWellnessCheckIn, CRISIS_SUPPORT_TEXT } from '../services/aiService';
import { 
  Smile, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  CheckCircle, 
  Info,
  Sliders,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CheckinScreenProps {
  userId: string;
  preferences: UserPreferences;
  hobbies: HobbyItem[];
  previousCheckins: WellnessCheckIn[];
  onSaveCheckIn: (checkIn: WellnessCheckIn) => Promise<void>;
}

export const CheckinScreen: React.FC<CheckinScreenProps> = ({
  userId,
  preferences,
  hobbies,
  previousCheckins,
  onSaveCheckIn
}) => {
  // Mode toggle: 'simple' (1-tap mood + 1-sentence note) vs 'advanced' (full biometric sliders & constraints)
  const [logMode, setLogMode] = useState<'simple' | 'advanced'>('simple');

  const [mood, setMood] = useState<MoodType>('good');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(2);
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [motivationLevel, setMotivationLevel] = useState<number>(3);
  const [journalText, setJournalText] = useState<string>('');
  const [concerns, setConcerns] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastAnalysis, setLastAnalysis] = useState<any | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const moodOptions: { id: MoodType; label: string; emoji: string; desc: string; defaultEnergy: number }[] = [
    { id: 'thriving', label: 'Thriving', emoji: '🌟', desc: 'Feeling vibrant & energized', defaultEnergy: 5 },
    { id: 'good', label: 'Good', emoji: '😊', desc: 'Positive & balanced', defaultEnergy: 4 },
    { id: 'okay', label: 'Okay', emoji: '😐', desc: 'Steady & coping moderately', defaultEnergy: 3 },
    { id: 'low', label: 'Low', emoji: '🌧️', desc: 'Drained, need gentle space', defaultEnergy: 2 },
    { id: 'overwhelmed', label: 'Overwhelmed', emoji: '⚠️', desc: 'High stress & heavy load', defaultEnergy: 1 },
  ];

  const handleSelectMood = (selected: MoodType) => {
    setMood(selected);
    const opt = moodOptions.find(o => o.id === selected);
    if (opt && logMode === 'simple') {
      setEnergyLevel(opt.defaultEnergy);
      setMotivationLevel(opt.defaultEnergy);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSavedSuccess(false);

    const checkIn: WellnessCheckIn = {
      id: 'checkin_' + Date.now(),
      userId,
      timestamp: new Date().toISOString(),
      mood,
      energyLevel,
      stressLevel,
      sleepQuality,
      motivationLevel,
      journalText,
      concernsOrNotes: concerns
    };

    try {
      const analysis = await analyzeWellnessCheckIn(checkIn, preferences, hobbies);
      checkIn.aiSummary = analysis.empatheticSummary;
      
      await onSaveCheckIn(checkIn);
      setLastAnalysis(analysis);
      setSavedSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Mode Switcher */}
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Daily <span className="text-emerald-700">Wellness Log</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {logMode === 'simple' 
              ? 'Quick Log: Capture your mood & thoughts in 10 seconds.' 
              : 'Advanced Log: Fine-tune physical energy, sleep metrics, and constraints.'}
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setLogMode('simple')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              logMode === 'simple'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simple (1-Tap)</span>
          </button>
          <button
            type="button"
            onClick={() => setLogMode('advanced')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              logMode === 'advanced'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced</span>
          </button>
        </div>
      </div>

      {/* Main Logging Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Step 1: Mood Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
            1. How are you feeling today?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {moodOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => handleSelectMood(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  mood === opt.id
                    ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/15 shadow-xs -translate-y-0.5'
                    : 'bg-slate-50/50 hover:bg-white border-slate-200/70 shadow-2xs'
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1">{opt.emoji}</div>
                <div className="text-sm font-semibold text-slate-900">{opt.label}</div>
                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Quick Note / Reflection */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
            2. Today's Highlight or Reflection
          </label>
          <p className="text-xs text-slate-500 mb-2">
            A quick sentence about your day, a purchase (e.g. bought a cycle), or what you're thinking.
          </p>
          <textarea
            rows={logMode === 'simple' ? 2 : 4}
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="e.g., I'm so happy today, I bought a cycle! / Finished my morning run feeling energized..."
            className="w-full text-sm font-normal p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
          />
        </div>

        {/* ADVANCED SECTION (Sliders, Constraints, Specific Biometrics) */}
        {logMode === 'advanced' && (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full inline-flex">
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Metrics & Constraints</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Energy */}
              <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/60 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                  <span>Physical Energy</span>
                  <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 border border-amber-200/80 rounded-md text-xs">{energyLevel} / 5</span>
                </div>
                <input 
                  type="range" min="1" max="5" value={energyLevel} 
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full" 
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 (Exhausted)</span>
                  <span>5 (High Energy)</span>
                </div>
              </div>

              {/* Stress */}
              <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/60 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                  <span>Perceived Stress</span>
                  <span className="font-mono bg-rose-50 text-rose-700 px-2 py-0.5 border border-rose-200/80 rounded-md text-xs">{stressLevel} / 5</span>
                </div>
                <input 
                  type="range" min="1" max="5" value={stressLevel} 
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full" 
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 (Calm & Serene)</span>
                  <span>5 (High Stress)</span>
                </div>
              </div>

              {/* Sleep Quality */}
              <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/60 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                  <span>Sleep Quality</span>
                  <span className="font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-200/80 rounded-md text-xs">{sleepQuality} / 5</span>
                </div>
                <input 
                  type="range" min="1" max="5" value={sleepQuality} 
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full" 
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 (Restless / Poor)</span>
                  <span>5 (Deep & Rested)</span>
                </div>
              </div>

              {/* Motivation */}
              <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/60 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                  <span>Motivation & Drive</span>
                  <span className="font-mono bg-teal-50 text-teal-800 px-2 py-0.5 border border-teal-200/80 rounded-md text-xs">{motivationLevel} / 5</span>
                </div>
                <input 
                  type="range" min="1" max="5" value={motivationLevel} 
                  onChange={(e) => setMotivationLevel(Number(e.target.value))}
                  className="w-full" 
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 (Low Drive)</span>
                  <span>5 (Ready to Conquer)</span>
                </div>
              </div>
            </div>

            {/* Optional Notes or Constraints */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                Specific Constraints or Context
              </label>
              <input
                type="text"
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="e.g. sore shoulder from workout, back-to-back meetings till 3 PM..."
                className="w-full text-sm font-normal p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {logMode === 'simple' ? (
              <span>⚡ Fast 1-tap mode active. Energy automatically calibrated to {energyLevel}/5.</span>
            ) : (
              <span>⚙️ Advanced mode: 4 biometric indicators mapped.</span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="brutalist-btn-primary px-6 py-2.5 flex items-center space-x-2 text-xs sm:text-sm disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            {isSubmitting ? (
              <span>Saving & Synthesizing...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Save Today's Log</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Empathy & Next Steps Feedback */}
      {lastAnalysis && (
        <div className={`p-6 border rounded-2xl shadow-xs ${
          lastAnalysis.crisisAlert 
            ? 'bg-rose-50 border-rose-200 text-rose-950' 
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}>
          {lastAnalysis.crisisAlert ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Crisis & Safety Support Resources</span>
              </div>
              <p className="text-sm text-rose-900 whitespace-pre-line leading-relaxed font-normal">
                {CRISIS_SUPPORT_TEXT}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Agent Buddy Synthesis</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {lastAnalysis.empatheticSummary}
              </p>

              {lastAnalysis.recommendedSteps.length > 0 && (
                <div className="pt-3 border-t border-emerald-200/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                    Actionable Next Steps for Today:
                  </span>
                  <ul className="space-y-1.5 text-sm font-medium text-slate-800">
                    {lastAnalysis.recommendedSteps.map((step: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
