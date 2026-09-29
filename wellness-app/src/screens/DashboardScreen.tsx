import React, { useState } from 'react';
import { 
  WellnessCheckIn, 
  TaskItem, 
  HobbyItem, 
  ActivityRecommendation, 
  MoodType 
} from '../types';
import { 
  Smile, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  ArrowRight, 
  PlusCircle, 
  Clock, 
  Calendar,
  AlertCircle,
  Zap,
  Send,
  Check,
  Sun,
  Moon,
  Sunset,
  Camera,
  Download,
  Flame,
  Award
} from 'lucide-react';
import { TabType } from '../components/Navbar';
import { PixelCompanion, CompanionType } from '../components/PixelCompanion';
import { playCompanionBoop, playTaskSuccess } from '../services/soundEffects';

interface DashboardScreenProps {
  userId?: string;
  userName?: string;
  checkins: WellnessCheckIn[];
  tasks: TaskItem[];
  hobbies: HobbyItem[];
  recommendations: ActivityRecommendation[];
  onNavigate: (tab: TabType) => void;
  onToggleTask: (task: TaskItem) => void;
  onSaveRecommendationAsTask: (rec: ActivityRecommendation) => void;
  onSaveCheckIn?: (checkin: WellnessCheckIn) => Promise<void>;
  companionType?: CompanionType;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userId,
  userName,
  checkins,
  tasks,
  hobbies,
  recommendations,
  onNavigate,
  onToggleTask,
  onSaveRecommendationAsTask,
  onSaveCheckIn,
  companionType = 'puppy'
}) => {
  const latestCheckin = checkins.length > 0 ? checkins[0] : null;
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedToday = tasks.filter(t => t.status === 'completed');

  // Quick 1-tap mood logging on dashboard
  const [quickNote, setQuickNote] = useState('');
  const [quickMood, setQuickMood] = useState<MoodType | null>(null);
  const [quickLoggedSuccess, setQuickLoggedSuccess] = useState(false);

  const quickMoods: { id: MoodType; emoji: string; label: string; energy: number }[] = [
    { id: 'thriving', emoji: '🌟', label: 'Thriving', energy: 5 },
    { id: 'good', emoji: '😊', label: 'Good', energy: 4 },
    { id: 'okay', emoji: '😐', label: 'Okay', energy: 3 },
    { id: 'low', emoji: '🌧️', label: 'Low', energy: 2 },
    { id: 'overwhelmed', emoji: '⚠️', label: 'Overwhelmed', energy: 1 }
  ];

  const handleQuickLog = async (selectedMood: MoodType) => {
    setQuickMood(selectedMood);
    const m = quickMoods.find(qm => qm.id === selectedMood);
    if (!m || !onSaveCheckIn) return;

    const newCheckIn: WellnessCheckIn = {
      id: 'checkin_' + Date.now(),
      userId: userId || 'anonymous_user',
      timestamp: new Date().toISOString(),
      mood: selectedMood,
      energyLevel: m.energy,
      stressLevel: selectedMood === 'overwhelmed' ? 5 : 2,
      sleepQuality: 4,
      motivationLevel: m.energy,
      journalText: quickNote.trim() || `Quick check-in logged as ${selectedMood}.`,
      aiSummary: `Quick 1-tap dashboard log: Mood ${selectedMood.toUpperCase()}.`
    };

    await onSaveCheckIn(newCheckIn);
    setQuickLoggedSuccess(true);
    setTimeout(() => {
      setQuickLoggedSuccess(false);
      setQuickNote('');
      setQuickMood(null);
    }, 3000);
  };

  const getMoodBadge = (mood: MoodType) => {
    switch (mood) {
      case 'thriving':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">🌟 Thriving</span>;
      case 'good':
        return <span className="bg-teal-50 text-teal-700 border border-teal-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">😊 Good</span>;
      case 'okay':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">😐 Okay / Steady</span>;
      case 'low':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">🌧️ Low Energy</span>;
      case 'overwhelmed':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">⚠️ Overwhelmed</span>;
    }
  };

  const getDayPhase = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };
  const currentPhase = getDayPhase();

  const rhythmPhases = [
    { id: 'morning', label: 'Morning Rise', time: '5:00 - 12:00', icon: Sun, color: '#fef3c7', advice: 'Hydrate, set a gentle intention & step into light.' },
    { id: 'afternoon', label: 'Afternoon Flow', time: '12:00 - 17:00', icon: Sunset, color: '#e0f2fe', advice: 'Steady focus, nourish your body & stretch out tension.' },
    { id: 'evening', label: 'Evening Decompress', time: '17:00 - 22:00', icon: Moon, color: '#ffedd5', advice: 'Dim harsh lights, chat with your buddy & unwind gently.' },
    { id: 'night', label: 'Night Rest', time: '22:00 - 5:00', icon: Sparkles, color: '#ede9fe', advice: 'Deep restorative rest. Tomorrow is an unhurried new canvas.' }
  ];

  const weeklyStreak = Math.max(checkins.length, 1);
  const celebratoryEntry = checkins.find(c => c.mood === 'thriving' || c.mood === 'good' || c.source === 'chat') || latestCheckin;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-7 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, <span className="text-emerald-700">{userName || 'Friend'}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            A quiet companion for humans. Daily rhythm, honest reflections, and restorative habits.
          </p>
        </div>
        <div className="flex gap-2.5 sm:gap-3 shrink-0">
          <button 
            onClick={() => onNavigate('checkin')} 
            className="brutalist-btn-primary flex items-center space-x-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Today's Check-in</span>
          </button>
          <button 
            onClick={() => onNavigate('assistant')} 
            className="brutalist-btn-outlined flex items-center space-x-2 text-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Chat Buddy</span>
          </button>
        </div>
      </div>

      {/* DAY AT A GLANCE: Human Circadian Rhythm Strip */}
      <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>⏰</span>
              <span>Day at a Glance • Human Rhythm</span>
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Current Phase: <strong className="text-emerald-700 capitalize">{currentPhase}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rhythmPhases.map((phase) => {
            const Icon = phase.icon;
            const isCurrent = currentPhase === phase.id;
            return (
              <div
                key={phase.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'border-emerald-300 ring-2 ring-emerald-500/15 shadow-xs bg-emerald-50/50' 
                    : 'border-slate-200/70 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-700' : 'text-slate-600'}`} />
                    <span className="text-xs font-semibold text-slate-900">{phase.label}</span>
                  </div>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mb-1">{phase.time}</div>
                <p className="text-xs text-slate-600 leading-snug">
                  {phase.advice}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK 1-TAP MOOD STRIP (Simplified Logging) */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Zap className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            <span>Quick 1-Tap Mood Log</span>
          </div>
          <button 
            onClick={() => onNavigate('checkin')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center space-x-1 hover:underline"
          >
            <span>Open Full Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {quickLoggedSuccess ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 text-xs font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Awesome! Mood logged in 1 tap and saved to your wellness record.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="grid grid-cols-5 gap-2 w-full sm:w-auto">
              {quickMoods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleQuickLog(m.id)}
                  title={m.label}
                  className="p-2 sm:p-2.5 border border-slate-200/80 rounded-xl bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-center shadow-2xs hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="text-xl sm:text-2xl">{m.emoji}</div>
                  <div className="text-[11px] font-medium text-slate-700 truncate mt-1">{m.label}</div>
                </button>
              ))}
            </div>

            <div className="flex-1 w-full flex items-center space-x-2">
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Optional 1-sentence note (e.g. 'Feeling great, bought a cycle!')..."
                className="w-full text-xs font-normal py-2.5 px-3 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* WEEKLY HUMAN PULSE: AI Reflection & Milestone Polaroid Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Pulse Card */}
        <div className="lg:col-span-2 p-5 sm:p-6 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-emerald-50/50 border border-amber-200/60 rounded-2xl shadow-xs space-y-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="text-xs font-bold text-slate-900">
                Weekly Human Pulse • {weeklyStreak} Days Active
              </span>
            </div>
            <span className="text-[10px] font-semibold bg-white/90 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full uppercase">
              AI Synthesized
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            "You're honoring your own pace. Whether it's picking up new gear, resting when energy dips, or taking five quiet minutes to reflect—consistency in being human is the greatest achievement."
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="bg-white/90 px-3 py-1 border border-slate-200/70 rounded-full text-slate-700 font-medium shadow-2xs">
              🌱 {completedToday.length} Tasks Checked Today
            </span>
            <span className="bg-white/90 px-3 py-1 border border-slate-200/70 rounded-full text-slate-700 font-medium shadow-2xs">
              🎯 {hobbies.length} Hobbies Tracked
            </span>
            <span className="bg-white/90 px-3 py-1 border border-slate-200/70 rounded-full text-slate-700 font-medium shadow-2xs">
              ❤️ {checkins.length} Total Check-ins
            </span>
          </div>
        </div>

        {/* Milestone Polaroid Card */}
        {celebratoryEntry && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Polaroid Milestone</span>
              </span>
              <span className="text-xs text-slate-400">
                {new Date(celebratoryEntry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl flex items-center space-x-3 my-2">
              <div className="p-1 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-xl shrink-0">
                <PixelCompanion type={companionType} emotion="smile" size={36} interactive={false} />
              </div>
              <p className="text-xs font-medium text-slate-700 italic line-clamp-2">
                "{celebratoryEntry.journalText || 'Had a wonderful and mindful day!'}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                Logged with Who-Hum
              </span>
              <button
                type="button"
                onClick={() => {
                  playCompanionBoop();
                  alert(`Milestone card exported! "${celebratoryEntry.journalText || 'Mindful Moment'}"`);
                }}
                className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg flex items-center space-x-1 hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Wellness Status & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Wellness Summary Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <Smile className="w-5 h-5 text-emerald-600" />
              <span>Current Wellness & State</span>
            </h2>
            <button 
              onClick={() => onNavigate('checkin')} 
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>{latestCheckin ? 'Update Details' : 'Start Check-in'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestCheckin ? (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Mood:</span>
                {getMoodBadge(latestCheckin.mood)}
                {latestCheckin.source === 'chat' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center space-x-1 shadow-2xs">
                    <span>💬</span>
                    <span>Generated from Chat</span>
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-auto font-mono">
                  {new Date(latestCheckin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {latestCheckin.journalText && (
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5 text-sm text-slate-800 italic leading-relaxed">
                  "{latestCheckin.journalText}"
                </div>
              )}

              {/* Energy / Stress / Sleep meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 text-center">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase">Energy</span>
                  <span className="text-sm font-semibold text-slate-900">{latestCheckin.energyLevel || 3} / 5</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 text-center">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase">Stress</span>
                  <span className="text-sm font-semibold text-slate-900">{latestCheckin.stressLevel || 2} / 5</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 text-center">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase">Sleep Quality</span>
                  <span className="text-sm font-semibold text-slate-900">{latestCheckin.sleepQuality || 4} / 5</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 text-center">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase">Motivation</span>
                  <span className="text-sm font-semibold text-slate-900">{latestCheckin.motivationLevel || 3} / 5</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-800 font-semibold">No check-in recorded yet today.</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">Use the 1-tap strip above or log your full day.</p>
              <button onClick={() => onNavigate('checkin')} className="brutalist-btn-primary text-xs">
                Log First Check-in
              </button>
            </div>
          )}
        </div>

        {/* Quick Progress Indicator */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Today's Completion</span>
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Task Progress</span>
                <span className="text-emerald-700 font-bold">
                  {tasks.length > 0 
                    ? `${Math.round((completedToday.length / tasks.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-slate-100 border border-slate-200/60 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${tasks.length > 0 ? (completedToday.length / tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>Active Goals:</span>
                <span className="font-semibold text-slate-900">{pendingTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks:</span>
                <span className="font-semibold text-emerald-700">{completedToday.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Hobbies:</span>
                <span className="font-semibold text-slate-900">{hobbies.filter(h => h.status === 'active').length}</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('tasks')} 
              className="w-full brutalist-btn-outlined text-xs py-2 mt-2"
            >
              Manage Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Two Columns: Priorities and Mood-Aware Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Priority Tasks & Focus</span>
            </h2>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              View all ({tasks.length})
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-sm font-medium text-slate-500">
              🎉 All caught up! No pending tasks right now.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-start space-x-3 p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white transition-all"
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => onToggleTask(task)}
                    className="mt-1 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <div className="flex items-center space-x-2.5 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{task.estimatedDurationMinutes}m</span>
                      </span>
                      <span className="capitalize px-2 py-0.5 bg-slate-100 border border-slate-200/70 rounded-full text-[10px] font-medium text-slate-700">
                        {task.category}
                      </span>
                      {task.priority === 'high' && (
                        <span className="text-rose-600 font-semibold text-[11px]">High Priority</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Restorative Activities */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-teal-600" />
              <span>Personalized Activities for You</span>
            </h2>
            <button 
              onClick={() => onNavigate('discover')}
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              Discover more
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-sm font-medium text-slate-500">
              Log a wellness check-in to generate tailored recommendations.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white transition-all space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 capitalize mb-1">
                        {rec.category}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900">{rec.title}</h3>
                    </div>
                    <span className="text-xs text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{rec.estimatedDurationMinutes}m</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.whyItFits}</p>
                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Cost: {rec.approximateCost}</span>
                    <button 
                      onClick={() => onSaveRecommendationAsTask(rec)}
                      className="brutalist-btn-primary text-xs py-1 px-3"
                    >
                      + Save to Tasks
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
