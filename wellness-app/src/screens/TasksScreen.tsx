import React, { useState } from 'react';
import { TaskItem, TaskPriority, TaskCategory, TaskStatus } from '../types';
import { 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  AlertCircle, 
  Sparkles,
  Zap
} from 'lucide-react';

interface TasksScreenProps {
  userId: string;
  tasks: TaskItem[];
  userEnergyLevel?: number;
  onSaveTask: (task: TaskItem) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  userId,
  tasks,
  userEnergyLevel = 3,
  onSaveTask,
  onDeleteTask
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [showEnergyFilter, setShowEnergyFilter] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New task form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('wellness');
  const [duration, setDuration] = useState<number>(30);
  const [energyRequired, setEnergyRequired] = useState<number>(3);
  const [dueDate, setDueDate] = useState<string>('');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      userId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      status: 'pending',
      estimatedDurationMinutes: duration,
      minEnergyRequired: energyRequired,
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveTask(newTask);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (task: TaskItem) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updated: TaskItem = {
      ...task,
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    };
    await onSaveTask(updated);
  };

  const handlePostpone = async (task: TaskItem) => {
    const updated: TaskItem = {
      ...task,
      status: 'postponed',
      updatedAt: new Date().toISOString()
    };
    await onSaveTask(updated);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (filterStatus === 'active' && task.status === 'completed') return false;
    if (filterStatus === 'completed' && task.status !== 'completed') return false;
    if (showEnergyFilter && (task.minEnergyRequired || 3) > userEnergyLevel) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Tasks & <span className="text-emerald-700">Gentle Goals</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Organize manageable priorities. Filter by energy level to honor your pace.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="brutalist-btn-primary flex items-center space-x-2 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task or Goal</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 text-xs">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === 'active' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({tasks.filter(t => t.status !== 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === 'completed' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === 'all' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="wellness">Wellness</option>
            <option value="hobby">Hobby</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="health">Health</option>
          </select>

          {/* Energy Filter Toggle */}
          <button
            onClick={() => setShowEnergyFilter(!showEnergyFilter)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              showEnergyFilter 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs' 
                : 'border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fit my energy (≤ {userEnergyLevel}/5)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{filteredTasks.length}</strong> items
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-80" />
          <h3 className="text-base font-semibold text-slate-900">No tasks match the active filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {showEnergyFilter 
              ? "All pending tasks require higher energy than your current level. Take time to recharge or lower task demands!"
              : "You're either all done or ready to add your next personal goal."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div 
              key={task.id}
              className={`bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex items-start gap-4 hover:shadow-sm ${
                task.status === 'completed' ? 'opacity-70 bg-slate-50/50' : 'bg-white'
              }`}
            >
              <button 
                onClick={() => handleToggleStatus(task)}
                className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-base font-semibold ${
                    task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}>
                    {task.title}
                  </h3>
                  {task.isAIGenerated && (
                    <span className="flex items-center space-x-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Suggested</span>
                    </span>
                  )}
                  {task.status === 'postponed' && (
                    <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-full font-semibold">
                      Postponed
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>
                )}

                {task.proposedReason && (
                  <p className="text-xs text-emerald-700 mt-1 italic">Why: {task.proposedReason}</p>
                )}

                <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.estimatedDurationMinutes} mins</span>
                  </span>
                  <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60 text-slate-700 text-[11px] font-medium">
                    {task.category}
                  </span>
                  <span className={`capitalize font-semibold text-[11px] ${
                    task.priority === 'high' ? 'text-rose-600' :
                    task.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {task.priority} Priority
                  </span>
                  {task.minEnergyRequired && (
                    <span className="flex items-center space-x-1 text-slate-600">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Energy {task.minEnergyRequired}/5</span>
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due {task.dueDate}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {task.status !== 'completed' && (
                  <button
                    onClick={() => handlePostpone(task)}
                    className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Postpone
                  </button>
                )}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Create Personal Task or Goal</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 20-minute evening walk, Prep lunch"
                  className="w-full p-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context or notes..."
                  className="w-full p-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full p-2 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-800"
                  >
                    <option value="wellness">Wellness</option>
                    <option value="hobby">Hobby</option>
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min. Energy (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={energyRequired}
                    onChange={(e) => setEnergyRequired(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50/60 border border-slate-200/80 rounded-xl text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brutalist-btn-primary px-4 py-2 text-xs font-semibold rounded-xl"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
