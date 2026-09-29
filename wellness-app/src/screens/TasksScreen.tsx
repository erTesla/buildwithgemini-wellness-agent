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
      <div className="material-card-flat p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-normal text-[#202124]">
            Tasks & <span className="font-semibold text-[#1a73e8]">Performance Goals</span>
          </h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Organize manageable priorities. Filter by energy level to prevent burnout.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="google-btn-primary flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task or Goal</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="material-card p-4 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex rounded-md border border-[#dadce0] overflow-hidden text-xs">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 font-medium ${
                filterStatus === 'active' ? 'bg-[#1a73e8] text-white' : 'bg-white text-[#5f6368] hover:bg-[#f8f9fa]'
              }`}
            >
              Active ({tasks.filter(t => t.status !== 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 font-medium border-l border-[#dadce0] ${
                filterStatus === 'completed' ? 'bg-[#1a73e8] text-white' : 'bg-white text-[#5f6368] hover:bg-[#f8f9fa]'
              }`}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 font-medium border-l border-[#dadce0] ${
                filterStatus === 'all' ? 'bg-[#1a73e8] text-white' : 'bg-white text-[#5f6368] hover:bg-[#f8f9fa]'
              }`}
            >
              All
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs border border-[#dadce0] rounded-md px-2.5 py-1.5 text-[#202124] focus:outline-none focus:border-[#1a73e8]"
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
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
              showEnergyFilter 
                ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]' 
                : 'border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fit my energy (≤ {userEnergyLevel}/5)</span>
          </button>
        </div>

        <div className="text-xs text-[#5f6368]">
          Showing <strong>{filteredTasks.length}</strong> items
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="material-card p-12 text-center text-[#5f6368]">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-[#1e8e3e] opacity-80" />
          <h3 className="text-base font-medium text-[#202124]">No tasks match the active filters</h3>
          <p className="text-xs text-[#5f6368] mt-1">
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
              className={`material-card p-4 transition-all flex items-start gap-4 ${
                task.status === 'completed' ? 'opacity-70 bg-[#fafafa]' : 'bg-white'
              }`}
            >
              <button 
                onClick={() => handleToggleStatus(task)}
                className="mt-1 flex-shrink-0 text-[#1a73e8] hover:opacity-80"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1e8e3e]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#5f6368]" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-base font-medium ${
                    task.status === 'completed' ? 'line-through text-[#5f6368]' : 'text-[#202124]'
                  }`}>
                    {task.title}
                  </h3>
                  {task.isAIGenerated && (
                    <span className="flex items-center space-x-1 text-[11px] bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full font-medium">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Suggested</span>
                    </span>
                  )}
                  {task.status === 'postponed' && (
                    <span className="text-[11px] bg-[#feefc3] text-[#b06000] px-2 py-0.5 rounded-full font-medium">
                      Postponed
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-xs text-[#5f6368] mt-1">{task.description}</p>
                )}

                {task.proposedReason && (
                  <p className="text-xs text-[#1a73e8] mt-1 italic">Why: {task.proposedReason}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#5f6368]">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.estimatedDurationMinutes} mins</span>
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded bg-[#f1f3f4] text-[#3c4043]">
                    {task.category}
                  </span>
                  <span className={`capitalize font-medium ${
                    task.priority === 'high' ? 'text-[#d93025]' :
                    task.priority === 'medium' ? 'text-[#f9ab00]' : 'text-[#5f6368]'
                  }`}>
                    {task.priority} Priority
                  </span>
                  {task.minEnergyRequired && (
                    <span className="flex items-center space-x-1 text-[#3c4043]">
                      <Zap className="w-3 h-3 text-[#f9ab00]" />
                      <span>Energy {task.minEnergyRequired}/5</span>
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center space-x-1 text-[#5f6368]">
                      <Calendar className="w-3.5 h-3.5" />
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
                    className="text-xs text-[#5f6368] hover:text-[#202124] px-2 py-1 border border-[#dadce0] rounded hover:bg-[#f8f9fa]"
                  >
                    Postpone
                  </button>
                )}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-[#5f6368] hover:text-[#d93025] p-1.5 rounded hover:bg-[#fce8e6] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-medium text-[#202124]">Create Personal Task or Goal</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 20-minute evening walk, Prep lunch"
                  className="w-full p-2.5 border border-[#dadce0] rounded-md text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context or notes..."
                  className="w-full p-2.5 border border-[#dadce0] rounded-md text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full p-2 border border-[#dadce0] rounded-md text-sm text-[#202124]"
                  >
                    <option value="wellness">Wellness</option>
                    <option value="hobby">Hobby</option>
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 border border-[#dadce0] rounded-md text-sm text-[#202124]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Est. Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2 border border-[#dadce0] rounded-md text-sm text-[#202124]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Min. Energy (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={energyRequired}
                    onChange={(e) => setEnergyRequired(Number(e.target.value))}
                    className="w-full p-2 border border-[#dadce0] rounded-md text-sm text-[#202124]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#dadce0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#5f6368] hover:text-[#202124]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="google-btn-primary text-sm"
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
