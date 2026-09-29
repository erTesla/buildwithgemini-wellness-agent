import React, { useState } from 'react';
import { 
  WellnessCheckIn, 
  TaskItem, 
  HobbyItem, 
  MoodType 
} from '../types';
import { 
  Smile, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Bot, 
  HeartHandshake, 
  Calendar,
  Check,
  Send,
  Sliders,
  Compass,
  ArrowRight
} from 'lucide-react';
import { TabType } from '../components/Navbar';

interface SimpleDashboardScreenProps {
  userId?: string;
  checkins: WellnessCheckIn[];
  tasks: TaskItem[];
  hobbies: HobbyItem[];
  onNavigate: (tab: TabType) => void;
  onToggleTask: (task: TaskItem) => void;
  onSaveCheckIn: (checkin: WellnessCheckIn) => Promise<void>;
  onSaveTask: (task: TaskItem) => Promise<void>;
  onSwitchToAdvanced: () => void;
}

export const SimpleDashboardScreen: React.FC<SimpleDashboardScreenProps> = ({
  userId,
  checkins,
  tasks,
  hobbies,
  onNavigate,
  onToggleTask,
  onSaveCheckIn,
  onSaveTask,
  onSwitchToAdvanced
}) => {
  const latestCheckin = checkins.length > 0 ? checkins[0] : null;
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedToday = tasks.filter(t => t.status === 'completed');

  // Quick 1-tap mood logging
  const [selectedMood, setSelectedMood] = useState<MoodType>('good');
  const [quickThought, setQuickThought] = useState('');
  const [justLogged, setJustLogged] = useState(false);

  // Quick new task input
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const moods: { id: MoodType; emoji: string; label: string; energy: number; bg: string }[] = [
    { id: 'thriving', emoji: '🌟', label: 'Great', energy: 5, bg: 'bg-[#bbf7d0]' },
    { id: 'good', emoji: '😊', label: 'Good', energy: 4, bg: 'bg-[#fef08a]' },
    { id: 'okay', emoji: '😐', label: 'Okay', energy: 3, bg: 'bg-[#e0e7ff]' },
    { id: 'low', emoji: '🌧️', label: 'Low', energy: 2, bg: 'bg-[#fed7aa]' },
    { id: 'overwhelmed', emoji: '⚠️', label: 'Stressed', energy: 1, bg: 'bg-[#fecaca]' }
  ];

  const handleInstantLog = async (mood: MoodType) => {
    setSelectedMood(mood);
    const m = moods.find(x => x.id === mood);
    const newEntry: WellnessCheckIn = {
      id: 'checkin_' + Date.now(),
      userId: userId || 'user',
      timestamp: new Date().toISOString(),
      mood,
      energyLevel: m ? m.energy : 3,
      stressLevel: mood === 'overwhelmed' ? 5 : 2,
      sleepQuality: 4,
      motivationLevel: m ? m.energy : 3,
      journalText: quickThought.trim() || `Feeling ${mood} today.`,
      aiSummary: `Logged mood as ${mood}.`
    };

    await onSaveCheckIn(newEntry);
    setJustLogged(true);
    setTimeout(() => {
      setJustLogged(false);
      setQuickThought('');
    }, 3000);
  };

  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: TaskItem = {
      id: 'task_' + Date.now(),
      userId: userId || 'user',
      title: newTaskTitle.trim(),
      priority: 'medium',
      category: 'personal',
      status: 'pending',
      estimatedDurationMinutes: 15,
      isAIGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveTask(task);
    setNewTaskTitle('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Friendly Simple Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
            Simple Mode Active
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Hello! How are you doing today?
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Everything you need in 3 clean steps: check your mood, focus on tasks, and chat with your companion.
          </p>
        </div>

        <button
          onClick={onSwitchToAdvanced}
          className="brutalist-btn-outlined text-xs py-1.5 px-3.5 rounded-xl flex items-center space-x-1.5"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Switch to Advanced</span>
        </button>
      </div>

      {/* STEP 1: 1-Tap Daily Mood Check-In */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Smile className="w-5 h-5 text-emerald-600" />
            <span>1. Tap Your Mood Today</span>
          </h2>
          {latestCheckin && (
            <span className="text-xs text-slate-400">
              Last update: {new Date(latestCheckin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {justLogged ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-xl flex items-center gap-2 shadow-2xs">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Saved! Your mood has been recorded in your wellness diary.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {moods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleInstantLog(m.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    latestCheckin?.mood === m.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 text-emerald-950 shadow-xs -translate-y-0.5 font-bold'
                      : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700 shadow-2xs font-medium'
                  }`}
                >
                  <div className="text-2xl">{m.emoji}</div>
                  <div className="text-xs mt-1">{m.label}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={quickThought}
                onChange={(e) => setQuickThought(e.target.value)}
                placeholder="Share a quick thought (e.g. 'I bought a cycle today!') or press Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInstantLog(selectedMood);
                }}
                className="flex-1 text-sm bg-slate-50/60 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
              />
              <button
                onClick={() => handleInstantLog(selectedMood)}
                className="brutalist-btn-primary px-4 text-xs font-semibold flex items-center gap-1.5 rounded-xl"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Today's Focus Tasks (Clean & Simple) */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>2. Today's Focus</span>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              {completedToday.length} / {tasks.length} Done
            </span>
          </h2>
          <button 
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Open Task Manager →
          </button>
        </div>

        {/* Add Quick Task Input */}
        <form onSubmit={handleCreateQuickTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task or priority for today..."
            className="flex-1 text-sm bg-slate-50/60 border border-slate-200/80 rounded-xl px-4 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="brutalist-btn-secondary px-4 text-xs font-semibold flex items-center gap-1 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Task list preview */}
        <div className="space-y-2">
          {pendingTasks.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs font-medium text-slate-500">
              🎉 No pending tasks! You are all caught up for today.
            </div>
          ) : (
            pendingTasks.slice(0, 4).map((task) => (
              <div 
                key={task.id}
                className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/60 shadow-2xs transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => onToggleTask(task)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{task.title}</span>
                <span className="text-xs text-slate-400">{task.estimatedDurationMinutes}m</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* STEP 3: Chat Buddy & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chat Buddy Quick Launch */}
        <div 
          onClick={() => onNavigate('assistant')}
          className="p-5 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-200/80 rounded-2xl shadow-xs cursor-pointer hover:-translate-y-0.5 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200/80 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-800" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Chat with Your Companion</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tell your buddy about your day, ask for cheer-up recipes, or explore restorative ideas.
          </p>
        </div>

        {/* Hobbies & Restorative Activities */}
        <div 
          onClick={() => onNavigate('hobbies')}
          className="p-5 bg-gradient-to-br from-sky-50/80 to-indigo-50/60 border border-sky-200/80 rounded-2xl shadow-xs cursor-pointer hover:-translate-y-0.5 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-white border border-sky-200/80 text-sky-700 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-sky-800" />
          </div>
          <h3 className="text-base font-bold text-slate-900">My Hobbies & Rest</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {hobbies.length} hobbies tracked. Keep work and personal recharge in balance.
          </p>
        </div>
      </div>
    </div>
  );
};
