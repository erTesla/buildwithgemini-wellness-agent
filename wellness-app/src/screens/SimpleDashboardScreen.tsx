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
      <div className="p-6 bg-white border-2 border-black rounded shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider bg-[#bbf7d0] border border-black px-2 py-0.5 rounded">
            Simple Mode Active
          </span>
          <h1 className="text-2xl font-black text-black mt-1">
            Hello! How are you doing today?
          </h1>
          <p className="text-sm font-medium text-zinc-600 mt-0.5">
            Everything you need in 3 clean steps: check your mood, focus on tasks, and chat with your buddy.
          </p>
        </div>

        <button
          onClick={onSwitchToAdvanced}
          className="text-xs font-bold font-mono px-3 py-1.5 border-2 border-black rounded bg-zinc-100 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_#000000] flex items-center space-x-1"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Switch to Advanced</span>
        </button>
      </div>

      {/* STEP 1: 1-Tap Daily Mood Check-In */}
      <div className="p-5 bg-white border-2 border-black rounded shadow-[4px_4px_0px_#000000] space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-black text-black flex items-center gap-2">
            <Smile className="w-5 h-5" />
            <span>1. Tap Your Mood Today</span>
          </h2>
          {latestCheckin && (
            <span className="text-xs font-mono text-zinc-500">
              Last update: {new Date(latestCheckin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {justLogged ? (
          <div className="p-3 bg-[#bbf7d0] border-2 border-black rounded text-xs font-bold text-black flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-800" />
            <span>Saved! Your mood has been recorded in your wellness diary.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleInstantLog(m.id)}
                  className={`p-3 rounded border-2 border-black text-center transition-all ${
                    latestCheckin?.mood === m.id
                      ? 'bg-[#facc15] shadow-[3px_3px_0px_#000000] -translate-y-0.5 font-black'
                      : `${m.bg} hover:brightness-95 shadow-[2px_2px_0px_#000000]`
                  }`}
                >
                  <div className="text-2xl">{m.emoji}</div>
                  <div className="text-xs font-bold text-black mt-1">{m.label}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={quickThought}
                onChange={(e) => setQuickThought(e.target.value)}
                placeholder="Share a quick thought (e.g. 'I bought a cycle today!') or press Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInstantLog(selectedMood);
                }}
                className="flex-1 text-sm font-medium py-2"
              />
              <button
                onClick={() => handleInstantLog(selectedMood)}
                className="brutalist-btn-primary px-4 text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Today's Focus Tasks (Clean & Simple) */}
      <div className="p-5 bg-white border-2 border-black rounded shadow-[4px_4px_0px_#000000] space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-black text-black flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>2. Today's Focus</span>
            <span className="text-xs font-mono font-bold bg-[#fef08a] px-2 py-0.5 border border-black rounded">
              {completedToday.length} / {tasks.length} Done
            </span>
          </h2>
          <button 
            onClick={() => onNavigate('tasks')}
            className="text-xs font-bold text-black hover:underline"
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
            className="flex-1 text-sm font-medium py-2"
          />
          <button
            type="submit"
            className="brutalist-btn-secondary px-4 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Task list preview */}
        <div className="space-y-2">
          {pendingTasks.length === 0 ? (
            <div className="p-4 bg-zinc-50 border-2 border-dashed border-black rounded text-center text-xs font-bold text-zinc-600">
              🎉 No pending tasks! You are all caught up for today.
            </div>
          ) : (
            pendingTasks.slice(0, 4).map((task) => (
              <div 
                key={task.id}
                className="flex items-center space-x-3 p-3 rounded border-2 border-black bg-white shadow-[2px_2px_0px_#000000]"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => onToggleTask(task)}
                  className="h-4 w-4 rounded"
                />
                <span className="flex-1 text-sm font-bold text-black truncate">{task.title}</span>
                <span className="text-xs font-mono text-zinc-500">{task.estimatedDurationMinutes}m</span>
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
          className="p-5 bg-[#fef08a] border-2 border-black rounded shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded bg-black text-white flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#facc15]" />
            </div>
            <ArrowRight className="w-4 h-4 text-black" />
          </div>
          <h3 className="text-base font-black text-black">Chat with Your Buddy</h3>
          <p className="text-xs font-medium text-zinc-800">
            Tell your buddy about your day, ask for cheer-up recipes, or explore travel ideas.
          </p>
        </div>

        {/* Hobbies & Restorative Activities */}
        <div 
          onClick={() => onNavigate('hobbies')}
          className="p-5 bg-[#bae6fd] border-2 border-black rounded shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded bg-black text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <ArrowRight className="w-4 h-4 text-black" />
          </div>
          <h3 className="text-base font-black text-black">My Hobbies & Rest</h3>
          <p className="text-xs font-medium text-zinc-800">
            {hobbies.length} hobbies tracked. Keep work and personal recharge in balance.
          </p>
        </div>
      </div>
    </div>
  );
};
