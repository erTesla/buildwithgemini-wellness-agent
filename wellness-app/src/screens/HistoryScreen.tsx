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
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          History & <span className="text-emerald-700">Wellness Journey</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review recorded patterns, habit consistency, and journal reflections over time.
        </p>
      </div>

      {/* Non-diagnostic disclaimer alert */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-600 shadow-2xs">
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <p>
          <strong className="text-slate-800">Objective pattern review:</strong> These visualizations display self-reported reflections over time. They do not calculate hidden clinical risk metrics or infer psychological diagnoses.
        </p>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center shadow-xs">
          <Calendar className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <span className="text-2xl font-bold text-slate-900">{checkins.length}</span>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total Wellness Check-ins</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center shadow-xs">
          <CheckCircle className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <span className="text-2xl font-bold text-slate-900">{completedTasks.length}</span>
          <p className="text-xs text-slate-500 mt-1 font-medium">Completed Tasks & Goals</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center shadow-xs">
          <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <span className="text-2xl font-bold text-slate-900">
            {hobbies.filter(h => h.status === 'active').length}
          </span>
          <p className="text-xs text-slate-500 mt-1 font-medium">Active Restorative Hobbies</p>
        </div>
      </div>

      {/* Mood Distribution Bar Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
          <Smile className="w-5 h-5 text-emerald-600" />
          <span>Recorded Mood Distribution</span>
        </h2>

        {checkins.length === 0 ? (
          <p className="text-sm text-slate-500">No check-in data recorded yet.</p>
        ) : (
          <div className="space-y-3 pt-2">
            {[
              { id: 'thriving', color: '#10b981' },
              { id: 'good', color: '#0d9488' },
              { id: 'okay', color: '#f59e0b' },
              { id: 'low', color: '#f43f5e' },
              { id: 'overwhelmed', color: '#e11d48' }
            ].map(({ id: m, color }) => {
              const count = moodCounts[m] || 0;
              const pct = checkins.length > 0 ? Math.round((count / checkins.length) * 100) : 0;
              return (
                <div key={m} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="capitalize font-semibold text-slate-800">{m}</span>
                    <span className="text-slate-500">{count} entries ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: color
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>Journal & Check-in Timeline</span>
        </h2>

        {checkins.length === 0 ? (
          <p className="text-sm text-slate-500">Your timeline will display check-in entries chronologically.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-emerald-100 space-y-6 pt-2">
            {checkins.map((item) => (
              <div key={item.id} className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600" />
                
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-emerald-800">
                        {new Date(item.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.source === 'chat' && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center space-x-1">
                          <span>💬</span>
                          <span>Generated from Chat</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] uppercase px-2.5 py-0.5 rounded-full font-semibold bg-white border border-slate-200/80 text-slate-700">
                      Mood: {item.mood}
                    </span>
                  </div>

                  {item.journalText && (
                    <p className="text-sm text-slate-800 italic leading-relaxed">
                      "{item.journalText}"
                    </p>
                  )}

                  {item.aiSummary && (
                    <p className="text-xs text-slate-600 pt-2 border-t border-slate-200/60 leading-relaxed">
                      <strong className="text-slate-800">AI Summary:</strong> {item.aiSummary}
                    </p>
                  )}

                  <div className="flex gap-4 text-[11px] text-slate-500 pt-1">
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
