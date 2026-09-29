import React from 'react';
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
  AlertCircle
} from 'lucide-react';
import { TabType } from '../components/Navbar';

interface DashboardScreenProps {
  checkins: WellnessCheckIn[];
  tasks: TaskItem[];
  hobbies: HobbyItem[];
  recommendations: ActivityRecommendation[];
  onNavigate: (tab: TabType) => void;
  onToggleTask: (task: TaskItem) => void;
  onSaveRecommendationAsTask: (rec: ActivityRecommendation) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  checkins,
  tasks,
  hobbies,
  recommendations,
  onNavigate,
  onToggleTask,
  onSaveRecommendationAsTask
}) => {
  const latestCheckin = checkins.length > 0 ? checkins[0] : null;
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedToday = tasks.filter(t => t.status === 'completed');

  const getMoodBadge = (mood: MoodType) => {
    switch (mood) {
      case 'thriving':
        return <span className="bg-[#e6f4ea] text-[#1e8e3e] border border-[#ceead6] px-3 py-1 rounded-full text-xs font-medium">🌟 Thriving</span>;
      case 'good':
        return <span className="bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-3 py-1 rounded-full text-xs font-medium">😊 Good</span>;
      case 'okay':
        return <span className="bg-[#fef7e0] text-[#b06000] border border-[#feefc3] px-3 py-1 rounded-full text-xs font-medium">😐 Okay / Steady</span>;
      case 'low':
        return <span className="bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] px-3 py-1 rounded-full text-xs font-medium">🌧️ Low Energy</span>;
      case 'overwhelmed':
        return <span className="bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] px-3 py-1 rounded-full text-xs font-medium">⚠️ Overwhelmed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="material-card-flat p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-normal text-[#202124]">
            Welcome back to your <span className="font-semibold text-[#1a73e8]">Daily Wellness Hub</span>
          </h1>
          <p className="text-sm text-[#5f6368] mt-1">
            Track daily mental wellness, harmonize personal tasks, and discover restorative hobbies.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('checkin')} 
            className="google-btn-primary flex items-center space-x-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Today's Check-in</span>
          </button>
          <button 
            onClick={() => onNavigate('assistant')} 
            className="google-btn-outlined flex items-center space-x-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Chat with Agent</span>
          </button>
        </div>
      </div>

      {/* Grid: Wellness Status & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Wellness Summary Card */}
        <div className="material-card p-5 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-medium text-[#202124] flex items-center space-x-2">
              <Smile className="w-5 h-5 text-[#1a73e8]" />
              <span>Current Wellness & State</span>
            </h2>
            <button 
              onClick={() => onNavigate('checkin')} 
              className="text-xs text-[#1a73e8] font-medium hover:underline flex items-center space-x-1"
            >
              <span>{latestCheckin ? 'Update' : 'Start Check-in'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {latestCheckin ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[#5f6368]">Self-Reported Mood:</span>
                {getMoodBadge(latestCheckin.mood)}
                <span className="text-xs text-[#5f6368] ml-auto">
                  {new Date(latestCheckin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {latestCheckin.journalText && (
                <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-3 text-sm text-[#3c4043] italic">
                  "{latestCheckin.journalText}"
                </div>
              )}

              {/* Energy / Stress / Sleep meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="bg-[#f8f9fa] p-2.5 rounded border border-[#dadce0] text-center">
                  <span className="block text-xs text-[#5f6368]">Energy</span>
                  <span className="text-sm font-medium text-[#202124]">{latestCheckin.energyLevel || 3} / 5</span>
                </div>
                <div className="bg-[#f8f9fa] p-2.5 rounded border border-[#dadce0] text-center">
                  <span className="block text-xs text-[#5f6368]">Stress</span>
                  <span className="text-sm font-medium text-[#202124]">{latestCheckin.stressLevel || 2} / 5</span>
                </div>
                <div className="bg-[#f8f9fa] p-2.5 rounded border border-[#dadce0] text-center">
                  <span className="block text-xs text-[#5f6368]">Sleep Quality</span>
                  <span className="text-sm font-medium text-[#202124]">{latestCheckin.sleepQuality || 4} / 5</span>
                </div>
                <div className="bg-[#f8f9fa] p-2.5 rounded border border-[#dadce0] text-center">
                  <span className="block text-xs text-[#5f6368]">Motivation</span>
                  <span className="text-sm font-medium text-[#202124]">{latestCheckin.motivationLevel || 3} / 5</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-[#f8f9fa] rounded-lg border border-dashed border-[#dadce0]">
              <AlertCircle className="w-8 h-8 text-[#5f6368] mx-auto mb-2" />
              <p className="text-sm text-[#202124] font-medium">No check-in recorded yet today.</p>
              <p className="text-xs text-[#5f6368] mt-1 mb-3">Taking 60 seconds to record your state helps the agent adapt your schedule.</p>
              <button onClick={() => onNavigate('checkin')} className="google-btn-primary text-xs">
                Log First Check-in
              </button>
            </div>
          )}
        </div>

        {/* Quick Progress Indicator */}
        <div className="material-card p-5">
          <h2 className="text-base font-medium text-[#202124] mb-3 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#1e8e3e]" />
            <span>Today's Completion</span>
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[#5f6368] mb-1">
                <span>Task Progress</span>
                <span>
                  {tasks.length > 0 
                    ? `${Math.round((completedToday.length / tasks.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-[#e8eaed] rounded-full h-2">
                <div 
                  className="bg-[#1e8e3e] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${tasks.length > 0 ? (completedToday.length / tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#dadce0] text-xs text-[#5f6368] space-y-2">
              <div className="flex justify-between">
                <span>Active Goals / Tasks:</span>
                <span className="font-medium text-[#202124]">{pendingTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks:</span>
                <span className="font-medium text-[#202124]">{completedToday.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Hobbies:</span>
                <span className="font-medium text-[#202124]">{hobbies.filter(h => h.status === 'active').length}</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('tasks')} 
              className="w-full google-btn-outlined text-xs py-2 mt-2"
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
            <h2 className="text-base font-medium text-[#202124] flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#1a73e8]" />
              <span>Priority Tasks & Focus</span>
            </h2>
            <button 
              onClick={() => onNavigate('tasks')}
              className="text-xs text-[#1a73e8] font-medium hover:underline"
            >
              View all ({tasks.length})
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#5f6368]">
              🎉 All caught up! No pending tasks right now.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg border border-[#dadce0] hover:bg-[#f8f9fa] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => onToggleTask(task)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#202124] truncate">{task.title}</p>
                    <div className="flex items-center space-x-3 text-xs text-[#5f6368] mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedDurationMinutes}m</span>
                      </span>
                      <span className="capitalize px-1.5 py-0.2 bg-[#e8f0fe] text-[#1a73e8] rounded">
                        {task.category}
                      </span>
                      {task.priority === 'high' && (
                        <span className="text-[#d93025] font-medium">High Priority</span>
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
            <h2 className="text-base font-medium text-[#202124] flex items-center space-x-2">
              <Compass className="w-5 h-5 text-[#f9ab00]" />
              <span>Personalized Activities for You</span>
            </h2>
            <button 
              onClick={() => onNavigate('discover')}
              className="text-xs text-[#1a73e8] font-medium hover:underline"
            >
              Discover more
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#5f6368]">
              Log a wellness check-in to generate tailored recommendations.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg border border-[#dadce0] bg-[#ffffff] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-[#e8f0fe] text-[#1a73e8] capitalize mb-1">
                        {rec.category}
                      </span>
                      <h3 className="text-sm font-medium text-[#202124]">{rec.title}</h3>
                    </div>
                    <span className="text-xs text-[#5f6368] flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{rec.estimatedDurationMinutes}m</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#5f6368]">{rec.whyItFits}</p>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-[#202124] font-medium">Cost: {rec.approximateCost}</span>
                    <button 
                      onClick={() => onSaveRecommendationAsTask(rec)}
                      className="google-btn-outlined text-xs py-1 px-3"
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
