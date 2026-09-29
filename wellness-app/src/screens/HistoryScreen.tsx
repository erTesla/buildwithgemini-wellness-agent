import React from 'react';
import { WellnessCheckIn, TaskItem, HobbyItem } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Smile, 
  Clock, 
  Info 
} from 'lucide-react';

interface HistoryScreenProps {
  checkins: WellnessCheckIn[];
  tasks: TaskItem[];
  hobbies: HobbyItem[];
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  checkins,
  tasks,
  hobbies
}) => {
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Compute mood distribution
  const moodCounts = checkins.reduce((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodColors: Record<string, string> = {
    thriving: '#1e8e3e',
    good: '#1a73e8',
    okay: '#f9ab00',
    low: '#d93025',
    overwhelmed: '#ea4335'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="material-card-flat p-6 bg-white">
        <h1 className="text-2xl font-normal text-[#202124]">
          History & <span className="font-semibold text-[#1a73e8]">Wellness Insights</span>
        </h1>
        <p className="text-sm text-[#5f6368] mt-1">
          Review recorded patterns, habit consistency, and journal reflections over time.
        </p>
      </div>

      {/* Non-diagnostic disclaimer alert */}
      <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-4 flex items-start space-x-3 text-xs text-[#5f6368]">
        <Info className="w-4 h-4 text-[#1a73e8] mt-0.5 flex-shrink-0" />
        <p>
          <strong>Objective pattern review:</strong> These visualizations display self-reported user inputs over time. They do not calculate hidden clinical risk metrics or infer psychological diagnoses.
        </p>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="material-card p-5 bg-white text-center">
          <Calendar className="w-6 h-6 text-[#1a73e8] mx-auto mb-2" />
          <span className="text-2xl font-semibold text-[#202124]">{checkins.length}</span>
          <p className="text-xs text-[#5f6368] mt-1">Total Wellness Check-ins</p>
        </div>

        <div className="material-card p-5 bg-white text-center">
          <CheckCircle className="w-6 h-6 text-[#1e8e3e] mx-auto mb-2" />
          <span className="text-2xl font-semibold text-[#202124]">{completedTasks.length}</span>
          <p className="text-xs text-[#5f6368] mt-1">Completed Tasks & Goals</p>
        </div>

        <div className="material-card p-5 bg-white text-center">
          <TrendingUp className="w-6 h-6 text-[#f9ab00] mx-auto mb-2" />
          <span className="text-2xl font-semibold text-[#202124]">
            {hobbies.filter(h => h.status === 'active').length}
          </span>
          <p className="text-xs text-[#5f6368] mt-1">Active Restorative Hobbies</p>
        </div>
      </div>

      {/* Mood Distribution Bar Chart */}
      <div className="material-card p-6 bg-white space-y-4">
        <h2 className="text-base font-medium text-[#202124] flex items-center space-x-2">
          <Smile className="w-5 h-5 text-[#1a73e8]" />
          <span>Recorded Mood Distribution</span>
        </h2>

        {checkins.length === 0 ? (
          <p className="text-sm text-[#5f6368]">No check-in data recorded yet.</p>
        ) : (
          <div className="space-y-3 pt-2">
            {['thriving', 'good', 'okay', 'low', 'overwhelmed'].map((m) => {
              const count = moodCounts[m] || 0;
              const pct = checkins.length > 0 ? Math.round((count / checkins.length) * 100) : 0;
              return (
                <div key={m} className="space-y-1">
                  <div className="flex justify-between text-xs text-[#5f6368]">
                    <span className="capitalize font-medium text-[#202124]">{m}</span>
                    <span>{count} entries ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#f1f3f4] rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: moodColors[m] || '#1a73e8'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chronological Journal Timeline */}
      <div className="material-card p-6 bg-white space-y-4">
        <h2 className="text-base font-medium text-[#202124] flex items-center space-x-2">
          <Clock className="w-5 h-5 text-[#1a73e8]" />
          <span>Journal & Check-in Timeline</span>
        </h2>

        {checkins.length === 0 ? (
          <p className="text-sm text-[#5f6368]">Your timeline will display check-in entries chronologically.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-[#dadce0] space-y-6 pt-2">
            {checkins.map((item) => (
              <div key={item.id} className="relative group">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#1a73e8]" />
                
                <div className="p-4 rounded-lg border border-[#dadce0] bg-[#ffffff] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#1a73e8]">
                      {new Date(item.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs uppercase px-2 py-0.5 rounded font-medium bg-[#f1f3f4] text-[#3c4043]">
                      Mood: {item.mood}
                    </span>
                  </div>

                  {item.journalText && (
                    <p className="text-sm text-[#202124] italic">
                      "{item.journalText}"
                    </p>
                  )}

                  {item.aiSummary && (
                    <p className="text-xs text-[#5f6368] pt-1 border-t border-[#dadce0]">
                      <strong>AI Summary:</strong> {item.aiSummary}
                    </p>
                  )}

                  <div className="flex gap-4 text-[11px] text-[#5f6368] pt-1">
                    <span>⚡ Energy: {item.energyLevel || 3}/5</span>
                    <span>🧘 Stress: {item.stressLevel || 2}/5</span>
                    <span>🌙 Sleep: {item.sleepQuality || 4}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
