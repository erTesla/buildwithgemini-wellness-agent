import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { DashboardScreen } from './screens/DashboardScreen';
import { SimpleChatScreen } from './screens/SimpleChatScreen';
import { CheckinScreen } from './screens/CheckinScreen';
import { TasksScreen } from './screens/TasksScreen';
import { HobbiesScreen } from './screens/HobbiesScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { AssistantScreen } from './screens/AssistantScreen';
import { ProfileScreen } from './screens/ProfileScreen';

import { 
  getCurrentUserId, 
  getCheckIns, 
  saveCheckIn, 
  getTasks, 
  saveTask, 
  deleteTask, 
  getHobbies, 
  saveHobby, 
  deleteHobby, 
  getUserPreferences, 
  saveUserPreferences 
} from './services/wellnessService';
import { 
  WellnessCheckIn, 
  TaskItem, 
  HobbyItem, 
  ActivityRecommendation, 
  UserPreferences 
} from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [userId, setUserId] = useState<string>(getCurrentUserId());
  
  // UI Mode: Simple vs Advanced (persisted in localStorage)
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('wellness_ui_mode');
    return saved !== null ? saved === 'simple' : true; // Default to Simple mode for effortless ease of access
  });

  const handleToggleSimpleMode = (simple: boolean) => {
    setIsSimpleMode(simple);
    localStorage.setItem('wellness_ui_mode', simple ? 'simple' : 'advanced');
  };
  
  const [checkins, setCheckins] = useState<WellnessCheckIn[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [hobbies, setHobbies] = useState<HobbyItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    userId,
    budgetLevel: 'moderate',
    typicalAvailableTimeMinutes: 45,
    preferredLocation: 'San Francisco, CA',
    consentExternalAI: true,
    enableCrisisAssistance: true,
    theme: 'google-light',
    dietaryOrCookingPreferences: 'Healthy, fresh meals, quick weeknight dinners',
    readingPreferences: 'Mindfulness, non-fiction, sci-fi, biography',
    travelPreferences: 'Local nature parks, quiet cafés, art museums, walking trails',
    updatedAt: new Date().toISOString()
  });
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all user records
  const loadUserData = async () => {
    try {
      const [loadedCheckins, loadedTasks, loadedHobbies, loadedPrefs] = await Promise.all([
        getCheckIns(userId),
        getTasks(userId),
        getHobbies(userId),
        getUserPreferences(userId)
      ]);
      setCheckins(loadedCheckins);
      setTasks(loadedTasks);
      setHobbies(loadedHobbies);
      setPreferences(loadedPrefs);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  // Task Handlers
  const handleSaveTask = async (task: TaskItem) => {
    await saveTask(task);
    setTasks(prev => {
      const filtered = prev.filter(t => t.id !== task.id);
      return [task, ...filtered];
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(userId, taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleToggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updated: TaskItem = {
      ...task,
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    };
    await handleSaveTask(updated);
  };

  // Hobby Handlers
  const handleSaveHobby = async (hobby: HobbyItem) => {
    await saveHobby(hobby);
    setHobbies(prev => {
      const filtered = prev.filter(h => h.id !== hobby.id);
      return [hobby, ...filtered];
    });
  };

  const handleDeleteHobby = async (hobbyId: string) => {
    await deleteHobby(userId, hobbyId);
    setHobbies(prev => prev.filter(h => h.id !== hobbyId));
  };

  // CheckIn Handler
  const handleSaveCheckIn = async (checkIn: WellnessCheckIn) => {
    await saveCheckIn(checkIn);
    setCheckins(prev => [checkIn, ...prev]);
  };

  // Preferences Handler
  const handleSavePreferences = async (prefs: UserPreferences) => {
    await saveUserPreferences(prefs);
    setPreferences(prefs);
  };

  // Convert recommendation to task
  const handleSaveRecommendationAsTask = async (rec: ActivityRecommendation) => {
    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      userId,
      title: rec.title,
      description: `${rec.whyItFits}\n\nSteps:\n${rec.actionableSteps.map(s => '- ' + s).join('\n')}`,
      priority: 'medium',
      category: rec.category === 'cooking' ? 'wellness' : rec.category === 'reading' ? 'hobby' : 'personal',
      status: 'pending',
      estimatedDurationMinutes: rec.estimatedDurationMinutes,
      isAIGenerated: true,
      proposedReason: rec.whyItFits,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await handleSaveTask(newTask);
  };

  const handleFeedback = (recId: string, feedback: 'tried_loved' | 'dismissed') => {
    setRecommendations(prev => 
      prev.map(r => r.id === recId ? { ...r, userFeedback: feedback } : r)
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#202124] flex flex-col font-sans">
      <Navbar 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab} 
        userId={userId} 
        isSimpleMode={isSimpleMode}
        onToggleSimpleMode={handleToggleSimpleMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-[#5f6368]">
            <span className="text-sm font-bold font-mono">Connecting to your personal wellness cloud...</span>
          </div>
        ) : isSimpleMode ? (
          <SimpleChatScreen
            userId={userId}
            checkins={checkins}
            tasks={tasks}
            hobbies={hobbies}
            preferences={preferences}
            onSaveTask={handleSaveTask}
            onSaveHobby={handleSaveHobby}
            onSaveCheckIn={handleSaveCheckIn}
            onSwitchToAdvanced={() => handleToggleSimpleMode(false)}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardScreen
                userId={userId}
                checkins={checkins}
                tasks={tasks}
                hobbies={hobbies}
                recommendations={recommendations}
                onNavigate={setCurrentTab}
                onToggleTask={handleToggleTask}
                onSaveRecommendationAsTask={handleSaveRecommendationAsTask}
                onSaveCheckIn={handleSaveCheckIn}
              />
            )}

            {currentTab === 'checkin' && (
              <CheckinScreen
                userId={userId}
                preferences={preferences}
                hobbies={hobbies}
                previousCheckins={checkins}
                onSaveCheckIn={handleSaveCheckIn}
              />
            )}

            {currentTab === 'tasks' && (
              <TasksScreen
                userId={userId}
                tasks={tasks}
                userEnergyLevel={checkins.length > 0 ? checkins[0].energyLevel : 3}
                onSaveTask={handleSaveTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {currentTab === 'hobbies' && (
              <HobbiesScreen
                userId={userId}
                hobbies={hobbies}
                preferences={preferences}
                onSaveHobby={handleSaveHobby}
                onDeleteHobby={handleDeleteHobby}
              />
            )}

            {currentTab === 'discover' && (
              <DiscoverScreen
                userId={userId}
                preferences={preferences}
                recommendations={recommendations}
                onSaveAsTask={handleSaveRecommendationAsTask}
                onSaveFeedback={handleFeedback}
              />
            )}

            {currentTab === 'history' && (
              <HistoryScreen
                checkins={checkins}
                tasks={tasks}
                hobbies={hobbies}
              />
            )}

            {currentTab === 'assistant' && (
              <AssistantScreen
                userId={userId}
                checkins={checkins}
                tasks={tasks}
                hobbies={hobbies}
                preferences={preferences}
                onSaveTask={handleSaveTask}
                onSaveHobby={handleSaveHobby}
                onSaveCheckIn={handleSaveCheckIn}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileScreen
                userId={userId}
                preferences={preferences}
                onSavePreferences={handleSavePreferences}
                onReloadAllData={loadUserData}
              />
            )}
          </>
        )}
      </main>

      {/* Calm Google Footer */}
      <footer className="border-t border-[#dadce0] py-6 text-center text-xs text-[#5f6368] bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Personal Wellness, Performance & Hobby Management Agent</span>
          <div className="flex gap-4">
            <span>Vertex AI Gemini 3.6 Flash</span>
            <span>Cloud Firestore</span>
            <span>Firebase Hosting</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
