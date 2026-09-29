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
  Check
} from 'lucide-react';
import { TabType } from '../components/Navbar';

interface DashboardScreenProps {
  userId?: string;
  checkins: WellnessCheckIn[];
  tasks: TaskItem[];
  hobbies: HobbyItem[];
  recommendations: ActivityRecommendation[];
  onNavigate: (tab: TabType) => void;
  onToggleTask: (task: TaskItem) => void;
  onSaveRecommendationAsTask: (rec: ActivityRecommendation) => void;
  onSaveCheckIn?: (checkin: WellnessCheckIn) => Promise<void>;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userId,
  checkins,
  tasks,
  hobbies,
  recommendations,
  onNavigate,
  onToggleTask,
  onSaveRecommendationAsTask,
  onSaveCheckIn
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
        return <span className="bg-[#bbf7d0] text-black border-2 border-black px-2.5 py-0.5 rounded text-xs font-bold shadow-[1px_1px_0px_#000000]">🌟 Thriving</span>;
      case 'good':
        return <span className="bg-[#fef08a] text-black border-2 border-black px-2.5 py-0.5 rounded text-xs font-bold shadow-[1px_1px_0px_#000000]">😊 Good</span>;
      case 'okay':
        return <span className="bg-[#e0e7ff] text-black border-2 border-black px-2.5 py-0.5 rounded text-xs font-bold shadow-[1px_1px_0px_#000000]">😐 Okay / Steady</span>;
      case 'low':
        return <span className="bg-[#fed7aa] text-black border-2 border-black px-2.5 py-0.5 rounded text-xs font-bold shadow-[1px_1px_0px_#000000]">🌧️ Low Energy</span>;
      case 'overwhelmed':
        return <span className="bg-[#fecaca] text-black border-2 border-black px-2.5 py-0.5 rounded text-xs font-bold shadow-[1px_1px_0px_#000000]">⚠️ Overwhelmed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="material-card-flat p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            Welcome back to your <span className="bg-[#facc15] px-1.5 py-0.5 border-2 border-black rounded text-xl">Wellness Hub</span>
          </h1>
          <p className="text-sm font-medium text-zinc-600 mt-1">
            Track daily mental wellness, harmonize personal tasks, and explore restorative adventures.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('checkin')} 
            className="brutalist-btn-primary flex items-center space-x-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Today's Check-in</span>
          </button>
          <button 
            onClick={() => onNavigate('assistant')} 
            className="brutalist-btn-secondary flex items-center space-x-2 text-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Chat Buddy</span>
          </button>
        </div>
      </div>

      {/* QUICK 1-TAP MOOD STRIP (Simplified Logging) */}
      <div className="p-4 bg-white border-2 border-black rounded shadow-[4px_4px_0px_#000000] space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-black">
            <Zap className="w-4 h-4 text-black fill-[#facc15]" />
            <span>Quick 1-Tap Mood Log</span>
          </div>
          <button 
            onClick={() => onNavigate('checkin')}
            className="text-xs font-mono font-bold text-zinc-600 hover:text-black underline flex items-center space-x-1"
          >
            <span>Open Full / Advanced Log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {quickLoggedSuccess ? (
          <div className="p-3 bg-[#bbf7d0] border-2 border-black rounded flex items-center space-x-2 text-xs font-bold text-black">
            <Check className="w-4 h-4 text-emerald-800" />
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
                  className="p-2 border-2 border-black rounded bg-zinc-50 hover:bg-[#fef08a] transition-all text-center shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  <div className="text-xl">{m.emoji}</div>
                  <div className="text-[10px] font-bold text-black truncate mt-0.5">{m.label}</div>
                </button>
              ))}
            </div>

            <div className="flex-1 w-full flex items-center space-x-2">
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Optional 1-sentence note (e.g. 'Feeling great, bought a cycle!')..."
                className="text-xs font-medium flex-1 py-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid: Wellness Status & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Wellness Summary Card */}
        <div className="material-card p-5 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-black flex items-center space-x-2">
              <Smile className="w-5 h-5 text-black" />
              <span>Current Wellness & State</span>
            </h2>
            <button 
              onClick={() => onNavigate('checkin')} 
              className="text-xs text-black font-bold hover:underline flex items-center space-x-1"
            >
              <span>{latestCheckin ? 'Update Details' : 'Start Check-in'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {latestCheckin ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Mood:</span>
                {getMoodBadge(latestCheckin.mood)}
                <span className="text-xs font-mono text-zinc-500 ml-auto">
                  {new Date(latestCheckin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {latestCheckin.journalText && (
                <div className="bg-zinc-50 border-2 border-black rounded p-3 text-sm text-black italic shadow-[2px_2px_0px_#000000]">
                  "{latestCheckin.journalText}"
                </div>
              )}

              {/* Energy / Stress / Sleep meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="bg-white p-2 rounded border-2 border-black text-center shadow-[1px_1px_0px_#000000]">
                  <span className="block text-[11px] font-bold text-zinc-600 uppercase">Energy</span>
                  <span className="text-sm font-mono font-bold text-black">{latestCheckin.energyLevel || 3} / 5</span>
                </div>
                <div className="bg-white p-2 rounded border-2 border-black text-center shadow-[1px_1px_0px_#000000]">
                  <span className="block text-[11px] font-bold text-zinc-600 uppercase">Stress</span>
                  <span className="text-sm font-mono font-bold text-black">{latestCheckin.stressLevel || 2} / 5</span>
                </div>
                <div className="bg-white p-2 rounded border-2 border-black text-center shadow-[1px_1px_0px_#000000]">
                  <span className="block text-[11px] font-bold text-zinc-600 uppercase">Sleep Quality</span>
                  <span className="text-sm font-mono font-bold text-black">{latestCheckin.sleepQuality || 4} / 5</span>
                </div>
                <div className="bg-white p-2 rounded border-2 border-black text-center shadow-[1px_1px_0px_#000000]">
                  <span className="block text-[11px] font-bold text-zinc-600 uppercase">Motivation</span>
                  <span className="text-sm font-mono font-bold text-black">{latestCheckin.motivationLevel || 3} / 5</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-zinc-50 rounded border-2 border-dashed border-black">
              <AlertCircle className="w-8 h-8 text-black mx-auto mb-2" />
              <p className="text-sm text-black font-bold">No check-in recorded yet today.</p>
              <p className="text-xs text-zinc-600 mt-1 mb-3 font-medium">Use the 1-tap strip above or log your full day.</p>
              <button onClick={() => onNavigate('checkin')} className="brutalist-btn-primary text-xs">
                Log First Check-in
              </button>
            </div>
          )}
        </div>

        {/* Quick Progress Indicator */}
        <div className="material-card p-5">
          <h2 className="text-base font-bold text-black mb-3 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-black" />
            <span>Today's Completion</span>
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-black mb-1">
                <span>Task Progress</span>
                <span>
                  {tasks.length > 0 
                    ? `${Math.round((completedToday.length / tasks.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-zinc-200 border-2 border-black rounded h-4 overflow-hidden">
                <div 
                  className="bg-[#facc15] h-full border-r-2 border-black transition-all duration-300"
                  style={{ width: `${tasks.length > 0 ? (completedToday.length / tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-black text-xs font-mono text-black space-y-1.5">
              <div className="flex justify-between">
                <span>Active Goals:</span>
                <span className="font-bold">{pendingTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks:</span>
                <span className="font-bold">{completedToday.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Hobbies:</span>
                <span className="font-bold">{hobbies.filter(h => h.status === 'active').length}</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('tasks')} 
              className="w-full brutalist-btn-secondary text-xs py-2 mt-2"
            >
              Manage Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Two Columns: Priorities and Mood-Aware Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Tasks */}
        <div className="material-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-black flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-black" />
              <span>Priority Tasks & Focus</span>
            </h2>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-xs text-black font-bold hover:underline"
            >
              View all ({tasks.length})
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-sm font-bold text-zinc-600">
              🎉 All caught up! No pending tasks right now.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-start space-x-3 p-3 rounded border-2 border-black bg-white shadow-[2px_2px_0px_#000000]"
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => onToggleTask(task)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black truncate">{task.title}</p>
                    <div className="flex items-center space-x-3 text-xs font-mono text-zinc-600 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedDurationMinutes}m</span>
                      </span>
                      <span className="capitalize px-1.5 py-0.2 bg-[#fef08a] border border-black rounded text-[10px]">
                        {task.category}
                      </span>
                      {task.priority === 'high' && (
                        <span className="text-red-700 font-bold">High Priority</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Restorative Activities */}
        <div className="material-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-black flex items-center space-x-2">
              <Compass className="w-5 h-5 text-black" />
              <span>Personalized Activities for You</span>
            </h2>
            <button 
              onClick={() => onNavigate('discover')}
              className="text-xs text-black font-bold hover:underline"
            >
              Discover more
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-sm font-bold text-zinc-600">
              Log a wellness check-in to generate tailored recommendations.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="p-3.5 rounded border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-0.5 text-[11px] font-bold font-mono rounded bg-[#bae6fd] border border-black text-black capitalize mb-1">
                        {rec.category}
                      </span>
                      <h3 className="text-sm font-bold text-black">{rec.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-600 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{rec.estimatedDurationMinutes}m</span>
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-700">{rec.whyItFits}</p>
                  <div className="pt-2 flex justify-between items-center border-t border-black">
                    <span className="text-xs font-mono font-bold text-black">Cost: {rec.approximateCost}</span>
                    <button 
                      onClick={() => onSaveRecommendationAsTask(rec)}
                      className="brutalist-btn-secondary text-xs py-1 px-3"
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
