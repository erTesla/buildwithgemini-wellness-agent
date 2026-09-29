import React, { useState } from 'react';
import { WellnessCheckIn, TaskItem, HobbyItem, MoodLevel } from '../types';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  Smile, 
  Clock, 
  ShieldCheck, 
  Filter, 
  Zap, 
  Moon, 
  HeartHandshake,
  MessageSquare
} from 'lucide-react';
import { playCompanionBoop } from '../services/soundEffects';

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
  const [filterSource, setFilterSource] = useState<'all' | 'chat' | 'manual'>('all');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const activeHobbies = hobbies.filter(h => h.status === 'active');

  // Compute mood distribution
  const moodCounts = checkins.reduce((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Compute averages
  const validCheckinsWithEnergy = checkins.filter(c => typeof c.energyLevel === 'number');
  const avgEnergy = validCheckinsWithEnergy.length > 0
    ? (validCheckinsWithEnergy.reduce((sum, c) => sum + (c.energyLevel || 0), 0) / validCheckinsWithEnergy.length).toFixed(1)
    : null;

  const validCheckinsWithSleep = checkins.filter(c => typeof c.sleepQuality === 'number');
  const avgSleep = validCheckinsWithSleep.length > 0
    ? (validCheckinsWithSleep.reduce((sum, c) => sum + (c.sleepQuality || 0), 0) / validCheckinsWithSleep.length).toFixed(1)
    : null;

  // Determine predominant mood
  let topMood: MoodLevel = 'good';
  let maxCount = -1;
  for (const m of Object.keys(moodCounts) as MoodLevel[]) {
    if (moodCounts[m] > maxCount) {
      maxCount = moodCounts[m];
      topMood = m;
    }
  }

  const moodMeta: Record<MoodLevel, { label: string; emoji: string; color: string; desc: string }> = {
    thriving: { label: 'Thriving', emoji: '🌟', color: '#10b981', desc: 'Energized & Joyful' },
    good: { label: 'Good', emoji: '😊', color: '#0d9488', desc: 'Calm & Steady' },
    okay: { label: 'Okay', emoji: '😐', color: '#f59e0b', desc: 'Neutral & Balanced' },
    low: { label: 'Low', emoji: '🌧️', color: '#f43f5e', desc: 'Needing Quiet Rest' },
    overwhelmed: { label: 'Overwhelmed', emoji: '⚠️', color: '#e11d48', desc: 'High Stress' }
  };

  // Filter checkins
  const filteredCheckins = checkins.filter(item => {
    const matchesSource = 
      filterSource === 'all' ? true :
      filterSource === 'chat' ? item.source === 'chat' :
      item.source !== 'chat';

    const matchesMood = selectedMoodFilter === 'all' || item.mood === selectedMoodFilter;
    return matchesSource && matchesMood;
  });

  const chatEntriesCount = checkins.filter(c => c.source === 'chat').length;
  const manualEntriesCount = checkins.filter(c => c.source !== 'chat').length;

  return (
    <div className="space-y-6">
      {/* Friendly Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Insights & <span className="text-emerald-700">Reflections</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Your weekly rhythm, mood trends, and companion notes — explained simply and warmly.
        </p>
      </div>

      {/* Wellness Pulse Summary Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Your Wellness Pulse</h2>
        </div>

        {checkins.length === 0 ? (
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to your wellness reflections! Once you log a check-in or have a chat with your companion, you'll see your energy and mood patterns here.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
              {topMood === 'thriving' && '🌟 You have been feeling energized and thriving recently! Keep nurturing what brings you this joy.'}
              {topMood === 'good' && '🌱 You have mostly felt calm, steady, and in good spirits. Your current routine is supporting you well.'}
              {topMood === 'okay' && '⚖️ You have been in an even, steady rhythm. Remember to take small restorative moments during your day.'}
              {topMood === 'low' && '🌧️ You have experienced lower energy recently. Be kind to yourself, sleep well, and lean on restorative habits.'}
              {topMood === 'overwhelmed' && '💙 You have had a demanding period. Prioritize slow deep breaths, quiet time, and consider saying no to non-essentials.'}
            </p>

            {/* 3 Simple Health Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0">
                  {moodMeta[topMood]?.emoji || '😊'}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Predominant Mood</span>
                  <p className="text-sm font-bold text-slate-900 capitalize">{topMood} ({moodMeta[topMood]?.desc})</p>
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Average Energy</span>
                  <p className="text-sm font-bold text-slate-900">
                    {avgEnergy ? `${avgEnergy} / 5` : 'Steady (3/5)'}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      {Number(avgEnergy || 3) >= 4 ? '• High' : Number(avgEnergy || 3) >= 3 ? '• Steady' : '• Resting'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Sleep Quality</span>
                  <p className="text-sm font-bold text-slate-900">
                    {avgSleep ? `${avgSleep} / 5` : 'Restful (4/5)'}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      {Number(avgSleep || 4) >= 4 ? '• Restful' : '• Fair'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mood Distribution Bar Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <Smile className="w-5 h-5 text-emerald-600" />
            <span>How You've Been Feeling</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {checkins.length} total entries recorded
          </span>
        </div>

        {checkins.length === 0 ? (
          <p className="text-sm text-slate-500">No feeling check-ins recorded yet.</p>
        ) : (
          <div className="space-y-3 pt-1">
            {(['thriving', 'good', 'okay', 'low', 'overwhelmed'] as MoodLevel[]).map((m) => {
              const meta = moodMeta[m];
              const count = moodCounts[m] || 0;
              const pct = checkins.length > 0 ? Math.round((count / checkins.length) * 100) : 0;

              return (
                <div key={m} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 flex items-center space-x-1.5">
                      <span>{meta.emoji}</span>
                      <span className="capitalize">{meta.label}</span>
                      <span className="text-slate-400 font-normal">({meta.desc})</span>
                    </span>
                    <span className="font-medium text-slate-500">{count} {count === 1 ? 'time' : 'times'} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: meta.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filterable Journal & Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Journal & Reflection Timeline</span>
          </h2>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                playCompanionBoop();
                setFilterSource('all');
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                filterSource === 'all'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              All Moments ({checkins.length})
            </button>

            <button
              onClick={() => {
                playCompanionBoop();
                setFilterSource('chat');
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all flex items-center space-x-1 ${
                filterSource === 'chat'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>💬 From Chat ({chatEntriesCount})</span>
            </button>

            <button
              onClick={() => {
                playCompanionBoop();
                setFilterSource('manual');
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all flex items-center space-x-1 ${
                filterSource === 'manual'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>📝 Check-Ins ({manualEntriesCount})</span>
            </button>
          </div>
        </div>

        {filteredCheckins.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50/60 rounded-xl border border-slate-200/60">
            <p className="text-sm">No reflection entries found for this filter.</p>
          </div>
        ) : (
          <div className="relative pl-5 sm:pl-6 border-l-2 border-emerald-100 space-y-5 pt-2">
            {filteredCheckins.map((item) => {
              const meta = moodMeta[item.mood] || moodMeta.good;
              const dateStr = new Date(item.timestamp).toLocaleDateString([], { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              });
              const timeStr = new Date(item.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              });

              return (
                <div key={item.id} className="relative group">
                  <span className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600" />
                  
                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-colors">
                    {/* Entry Header */}
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-emerald-800">
                          {dateStr} at {timeStr}
                        </span>

                        {item.source === 'chat' && (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center space-x-1">
                            <span>💬</span>
                            <span>Generated from Chat</span>
                          </span>
                        )}

                        {item.source !== 'chat' && (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                            📝 Daily Check-In
                          </span>
                        )}
                      </div>

                      {/* Mood Tag */}
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-white border border-slate-200/80 text-slate-800 flex items-center space-x-1">
                        <span>{meta.emoji}</span>
                        <span className="capitalize">{item.mood}</span>
                      </span>
                    </div>

                    {/* Journal Note */}
                    {item.journalText && (
                      <p className="text-sm text-slate-800 italic leading-relaxed pt-1">
                        "{item.journalText}"
                      </p>
                    )}

                    {/* AI Reflection */}
                    {item.aiSummary && (
                      <div className="text-xs text-slate-700 pt-2 border-t border-slate-200/60 leading-relaxed flex items-start space-x-2">
                        <span className="text-emerald-600 shrink-0 mt-0.5">💡</span>
                        <p>
                          <strong className="text-slate-900 font-semibold">Companion Note:</strong> {item.aiSummary}
                        </p>
                      </div>
                    )}

                    {/* Biometrics */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                      <span>⚡ Energy: <strong>{item.energyLevel || 3}/5</strong></span>
                      <span>🧘 Stress: <strong>{item.stressLevel || 2}/5</strong></span>
                      <span>🌙 Sleep: <strong>{item.sleepQuality || 4}/5</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reassuring Privacy Card */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-600 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p>
          <strong className="text-slate-800">Private & Safe:</strong> These reflections are saved to your personal wellness journal to help you notice gentle patterns over time. You are in complete control of your reflections.
        </p>
      </div>
    </div>
  );
};
