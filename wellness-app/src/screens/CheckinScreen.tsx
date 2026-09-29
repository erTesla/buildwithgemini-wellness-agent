import React, { useState } from 'react';
import { WellnessCheckIn, MoodType, UserPreferences, HobbyItem } from '../types';
import { analyzeWellnessCheckIn, CRISIS_SUPPORT_TEXT } from '../services/aiService';
import { Smile, AlertTriangle, Sparkles, Send, CheckCircle, Info } from 'lucide-react';

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

  const moodOptions: { id: MoodType; label: string; emoji: string; desc: string }[] = [
    { id: 'thriving', label: 'Thriving', emoji: '🌟', desc: 'Feeling vibrant, energized and capable' },
    { id: 'good', label: 'Good', emoji: '😊', desc: 'Positive, content, generally balanced' },
    { id: 'okay', label: 'Okay', emoji: '😐', desc: 'Steady, neutral, coping moderately' },
    { id: 'low', label: 'Low', emoji: '🌧️', desc: 'Drained, quiet, need gentle space' },
    { id: 'overwhelmed', label: 'Overwhelmed', emoji: '⚠️', desc: 'High stress, too many demands' },
  ];

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
      {/* Title */}
      <div className="material-card-flat p-6 bg-white">
        <h1 className="text-2xl font-normal text-[#202124]">
          Daily <span className="font-semibold text-[#1a73e8]">Wellness Check-in</span>
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          Tune in to how you are feeling today. Your updates are private, stored securely, and used to tailor reasonable tasks and restorative ideas.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-4 flex items-start space-x-3 text-xs text-[#5f6368]">
        <Info className="w-4 h-4 text-[#1a73e8] mt-0.5 flex-shrink-0" />
        <p>
          <strong>Personal wellness note:</strong> This application is intended for personal lifestyle support, mindfulness, and healthy habits. It does not provide medical diagnoses or replace clinical therapy.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="material-card p-6 space-y-6">
        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-[#202124] mb-3">
            1. How would you summarize your mood today?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {moodOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setMood(opt.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  mood === opt.id
                    ? 'border-[#1a73e8] bg-[#e8f0fe] ring-2 ring-[#1a73e8]'
                    : 'border-[#dadce0] hover:bg-[#f8f9fa]'
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-sm font-medium text-[#202124]">{opt.label}</div>
                <div className="text-xs text-[#5f6368] line-clamp-2 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders: Energy, Stress, Sleep, Motivation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#dadce0]">
          {/* Energy */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-[#202124]">Physical Energy</span>
              <span className="text-[#1a73e8] font-semibold">{energyLevel} / 5</span>
            </div>
            <input 
              type="range" min="1" max="5" value={energyLevel} 
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full accent-[#1a73e8]" 
            />
            <div className="flex justify-between text-xs text-[#5f6368] mt-0.5">
              <span>1 (Exhausted)</span>
              <span>5 (High Energy)</span>
            </div>
          </div>

          {/* Stress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-[#202124]">Perceived Stress</span>
              <span className="text-[#d93025] font-semibold">{stressLevel} / 5</span>
            </div>
            <input 
              type="range" min="1" max="5" value={stressLevel} 
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full accent-[#d93025]" 
            />
            <div className="flex justify-between text-xs text-[#5f6368] mt-0.5">
              <span>1 (Calm & Serene)</span>
              <span>5 (High Stress)</span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-[#202124]">Sleep Quality (Last Night)</span>
              <span className="text-[#1e8e3e] font-semibold">{sleepQuality} / 5</span>
            </div>
            <input 
              type="range" min="1" max="5" value={sleepQuality} 
              onChange={(e) => setSleepQuality(Number(e.target.value))}
              className="w-full accent-[#1e8e3e]" 
            />
            <div className="flex justify-between text-xs text-[#5f6368] mt-0.5">
              <span>1 (Restless / Poor)</span>
              <span>5 (Deep & Rested)</span>
            </div>
          </div>

          {/* Motivation */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-[#202124]">Daily Motivation</span>
              <span className="text-[#f9ab00] font-semibold">{motivationLevel} / 5</span>
            </div>
            <input 
              type="range" min="1" max="5" value={motivationLevel} 
              onChange={(e) => setMotivationLevel(Number(e.target.value))}
              className="w-full accent-[#f9ab00]" 
            />
            <div className="flex justify-between text-xs text-[#5f6368] mt-0.5">
              <span>1 (Low Drive)</span>
              <span>5 (Ready to Create)</span>
            </div>
          </div>
        </div>

        {/* Free-text Journal */}
        <div className="pt-2 border-t border-[#dadce0]">
          <label className="block text-sm font-medium text-[#202124] mb-1">
            Free-Text Reflection & Journal Entry
          </label>
          <p className="text-xs text-[#5f6368] mb-2">
            What is on your mind today? Any events, feelings, or small wins you want to note?
          </p>
          <textarea
            rows={4}
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Write a few thoughts about your day, how your mind feels, or things you would like to accomplish..."
            className="w-full p-3 border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none"
          />
        </div>

        {/* Concerns */}
        <div>
          <label className="block text-sm font-medium text-[#202124] mb-1">
            Optional Notes or Constraints
          </label>
          <input
            type="text"
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
            placeholder="e.g. sore shoulder, busy afternoon meetings, rainy weather..."
            className="w-full p-2.5 border border-[#dadce0] rounded-lg text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="google-btn-primary flex items-center space-x-2"
          >
            {isSubmitting ? (
              <span>Saving & Synthesizing...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Save Today's Check-in</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Empathy & Next Steps Feedback */}
      {lastAnalysis && (
        <div className={`material-card p-6 border-l-4 ${
          lastAnalysis.crisisAlert ? 'border-l-[#d93025] bg-[#fdf2f2]' : 'border-l-[#1a73e8] bg-white'
        }`}>
          {lastAnalysis.crisisAlert ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[#d93025] font-semibold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Crisis & Safety Support Resources</span>
              </div>
              <p className="text-sm text-[#3c4043] whitespace-pre-line leading-relaxed">
                {CRISIS_SUPPORT_TEXT}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#1a73e8] font-medium text-base">
                <Sparkles className="w-5 h-5" />
                <span>Agent Empathetic Summary</span>
              </div>
              <p className="text-sm text-[#3c4043] leading-relaxed">
                {lastAnalysis.empatheticSummary}
              </p>

              {lastAnalysis.recommendedSteps.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-2">
                    Gentle Next Steps for Today
                  </h4>
                  <ul className="space-y-1.5 text-sm text-[#202124]">
                    {lastAnalysis.recommendedSteps.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-[#1e8e3e] mt-0.5 flex-shrink-0" />
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

      {/* Review Previous Entries */}
      <div className="material-card p-6">
        <h2 className="text-base font-medium text-[#202124] mb-4">
          Past Check-in History ({previousCheckins.length})
        </h2>
        {previousCheckins.length === 0 ? (
          <p className="text-sm text-[#5f6368]">No recorded past check-ins yet.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {previousCheckins.map((entry) => (
              <div key={entry.id} className="p-3.5 border border-[#dadce0] rounded-lg bg-[#ffffff] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-[#1a73e8]">
                    {new Date(entry.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-[#f1f3f4] text-[#3c4043]">
                    Mood: {entry.mood}
                  </span>
                </div>
                {entry.journalText && (
                  <p className="text-sm text-[#3c4043] line-clamp-3">"{entry.journalText}"</p>
                )}
                <div className="flex gap-4 text-xs text-[#5f6368] pt-1">
                  <span>Energy: {entry.energyLevel}/5</span>
                  <span>Stress: {entry.stressLevel}/5</span>
                  <span>Sleep: {entry.sleepQuality}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
