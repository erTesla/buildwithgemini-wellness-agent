import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { 
  switchUserId, 
  exportAllUserData, 
  clearAllUserData,
  setUserNameAndId,
  getCurrentUserName 
} from '../services/wellnessService';
import { PixelCompanion } from '../components/PixelCompanion';
import { CompanionType, ALL_COMPANIONS, formatCompanionLabel } from '../domain/companions';
import { playCompanionBoop } from '../services/soundEffects';
import { 
  User, 
  Shield, 
  Download, 
  Trash2, 
  Save, 
  MapPin, 
  Clock, 
  DollarSign, 
  Info,
  CheckCircle2,
  Sparkles,
  Bell,
  Smartphone
} from 'lucide-react';
import { 
  DAILY_CHECKIN_SCHEDULE, 
  requestNotificationPermission, 
  testScheduleCheckInNotification, 
  getNotificationPermission 
} from '../services/notificationService';

interface ProfileScreenProps {
  userId: string;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => Promise<void>;
  onReloadAllData: () => Promise<void>;
  companionType?: CompanionType;
  onChangeCompanionType?: (type: CompanionType) => void;
  userName?: string;
  onUpdateUserName?: (name: string) => Promise<void>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userId,
  preferences,
  onSavePreferences,
  onReloadAllData,
  companionType = 'cat',
  onChangeCompanionType,
  userName,
  onUpdateUserName
}) => {
  const [preferredLocation, setPreferredLocation] = useState(preferences.preferredLocation || 'San Francisco, CA');
  const [budgetLevel, setBudgetLevel] = useState(preferences.budgetLevel);
  const [availableTime, setAvailableTime] = useState(preferences.typicalAvailableTimeMinutes);
  const [dietary, setDietary] = useState(preferences.dietaryOrCookingPreferences || '');
  const [reading, setReading] = useState(preferences.readingPreferences || '');
  const [travel, setTravel] = useState(preferences.travelPreferences || '');
  const [consentAI, setConsentAI] = useState(preferences.consentExternalAI);
  const [enableCrisis, setEnableCrisis] = useState(preferences.enableCrisisAssistance);

  const [customUserName, setCustomUserName] = useState(userName || getCurrentUserName());
  const [customUserId, setCustomUserId] = useState(userId);
  const [savedStatus, setSavedStatus] = useState<string>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('whohum_notifications_enabled') === 'true' && getNotificationPermission() === 'granted';
  });

  const handleToggleNotifications = async () => {
    playCompanionBoop();
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('whohum_notifications_enabled', 'true');
        testScheduleCheckInNotification();
      } else {
        alert('Please allow notifications in your browser/device settings to enable daily mental health check-ins.');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('whohum_notifications_enabled', 'false');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserPreferences = {
      ...preferences,
      preferredLocation,
      budgetLevel,
      typicalAvailableTimeMinutes: availableTime,
      dietaryOrCookingPreferences: dietary,
      readingPreferences: reading,
      travelPreferences: travel,
      consentExternalAI: consentAI,
      enableCrisisAssistance: enableCrisis,
      updatedAt: new Date().toISOString()
    };
    await onSavePreferences(updated);
    setSavedStatus('Preferences saved successfully!');
    setTimeout(() => setSavedStatus(''), 3000);
  };

  const handleUpdateUserName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customUserName.trim()) {
      if (onUpdateUserName) {
        await onUpdateUserName(customUserName.trim());
      } else {
        setUserNameAndId(customUserName.trim());
        await onReloadAllData();
      }
      setSavedStatus(`Username updated to "${customUserName.trim()}". Your data is synced!`);
      setTimeout(() => setSavedStatus(''), 4000);
    }
  };

  const handleSwitchAccount = async () => {
    if (customUserId.trim() && customUserId.trim() !== userId) {
      switchUserId(customUserId.trim());
      await onReloadAllData();
      window.location.reload();
    }
  };

  const handleExportData = async () => {
    const data = await exportAllUserData(userId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness_data_${userId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    const confirm = window.confirm(
      'Are you sure you want to permanently clear all stored check-ins, tasks, and hobbies for this account ID?'
    );
    if (confirm) {
      await clearAllUserData(userId);
      await onReloadAllData();
      alert('All local and cached user data has been cleared.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-sky-50/50 border border-emerald-100/80 rounded-2xl shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Profile & <span className="text-emerald-700">Application Settings</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Control your personal wellness preferences, manage data retention, and export or delete your information.
        </p>
      </div>

      {savedStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm shadow-2xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{savedStatus}</span>
        </div>
      )}

      {/* Username & Shared Data Access */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Your Username & Shared Data Access</span>
          </h2>
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            Non-Unique
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your username does not need to be unique! By entering this username on any device or session, you can keep updating your daily reflections, tasks, and wellness routines seamlessly.
        </p>

        <form onSubmit={handleUpdateUserName} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            value={customUserName}
            onChange={(e) => setCustomUserName(e.target.value)}
            placeholder="e.g. Alex, Maya, Sam..."
            className="p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-900 flex-1 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="brutalist-btn-primary text-xs py-2.5 px-4 rounded-xl whitespace-nowrap"
          >
            Update Username
          </button>
        </form>
      </div>

      {/* Account Identity Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
          <User className="w-5 h-5 text-emerald-600" />
          <span>Account & Identity Isolation</span>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Each User ID accesses strictly isolated records in Firestore. You can switch IDs to test multiple user profiles or use a dedicated identifier.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            value={customUserId}
            onChange={(e) => setCustomUserId(e.target.value)}
            className="p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 flex-1 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
          />
          <button
            onClick={handleSwitchAccount}
            className="brutalist-btn-outlined text-xs py-2 px-4 rounded-xl whitespace-nowrap"
          >
            Switch User ID
          </button>
        </div>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        <h2 className="text-base font-semibold text-slate-900">Personal Activity Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Preferred Location / City</span>
            </label>
            <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
            />
          </div>

          {/* Budget Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Budget Preference</span>
            </label>
            <select
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
            >
              <option value="budget">Budget-Friendly (Free to Low Cost)</option>
              <option value="moderate">Moderate ($10 - $50)</option>
              <option value="flexible">Flexible / High Value</option>
            </select>
          </div>

          {/* Available Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Typical Available Time (Minutes)</span>
            </label>
            <input
              type="number"
              min="15"
              step="15"
              max="240"
              value={availableTime}
              onChange={(e) => setAvailableTime(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
            />
          </div>

          {/* Travel / Outings */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Travel & Outing Preferences
            </label>
            <input
              type="text"
              value={travel}
              onChange={(e) => setTravel(e.target.value)}
              placeholder="e.g. Quiet gardens, art galleries, scenic coastal walks"
              className="w-full p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Dietary & Reading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dietary & Cooking Interests
            </label>
            <textarea
              rows={2}
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="e.g. Plant-based, Mediterranean, quick 20-min meals"
              className="w-full p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reading & Book Interests
            </label>
            <textarea
              rows={2}
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              placeholder="e.g. Behavioral psychology, biographies, nature essays"
              className="w-full p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Privacy & Safety Consent */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Privacy & AI Consent</span>
          </h3>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consentAI"
              checked={consentAI}
              onChange={(e) => setConsentAI(e.target.checked)}
              className="mt-1 h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="consentAI" className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Authorize AI Personalization:</strong> Allow the agent to process self-reported wellness notes and hobbies for personalized activity suggestions. No journal entries are used for external commercial advertising.
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="enableCrisis"
              checked={enableCrisis}
              onChange={(e) => setEnableCrisis(e.target.checked)}
              className="mt-1 h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="enableCrisis" className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Crisis & Distress Detection:</strong> Maintain immediate hotline recommendations and emergency resources if severe distress or harm triggers are recognized.
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button type="submit" className="brutalist-btn-primary flex items-center space-x-2 text-sm py-2.5 px-5 rounded-xl">
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Quiet Companion Preference */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Quiet Companion Preference</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose which companion accompanies your wellness journey. Changes apply across your chats and dashboards.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 border border-slate-200/80 rounded-xl text-slate-700 self-start sm:self-auto shadow-2xs">
            Current: {formatCompanionLabel(companionType)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {ALL_COMPANIONS.map((item) => {
            const isSelected = companionType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onChangeCompanionType) {
                    playCompanionBoop();
                    onChangeCompanionType(item.id);
                    localStorage.setItem('whohum_companion', item.id);
                    localStorage.setItem('whohum_companion_chosen', 'true');
                  }
                }}
                className={`p-3 border rounded-2xl text-center transition-all flex flex-col items-center justify-between space-y-2 ${
                  isSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/80 text-emerald-950 shadow-xs -translate-y-0.5 font-semibold'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50/70 text-slate-700 shadow-2xs font-medium'
                }`}
              >
                <div className="p-1 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                  <PixelCompanion type={item.id} emotion={isSelected ? 'smile' : 'idle'} size={36} interactive={false} />
                </div>
                <div className="text-xs font-semibold flex items-center gap-1">
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                </div>
                <div className={`text-[10px] ${isSelected ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  {item.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4x Daily Timely Mental Health Notifications */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <span>4x Daily Timely Mental Health Pings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled check-ins to monitor your mental wellness throughout your active day until bedtime.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                notificationsEnabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {notificationsEnabled ? '✓ Daily Pings Active' : 'Enable 4x Daily Pings'}
            </button>
            {notificationsEnabled && (
              <button
                type="button"
                onClick={() => {
                  playCompanionBoop();
                  testScheduleCheckInNotification();
                }}
                className="brutalist-btn-outlined text-xs py-1.5 px-3 rounded-xl"
                title="Send a sample check-in notification now"
              >
                Send Test Ping
              </button>
            )}
          </div>
        </div>

        {/* 4 Scheduled Touchpoints Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {DAILY_CHECKIN_SCHEDULE.map((slot) => (
            <div key={slot.slot} className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{slot.name}</span>
                <span className="font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-slate-200/60 text-[10px]">
                  {slot.time}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                {slot.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export & Deletion */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Data Portability & Account Erasure</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You have full control over your personal records. You can download a complete JSON backup at any time or erase all records from this client.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={handleExportData}
            className="brutalist-btn-outlined flex items-center space-x-2 text-xs py-2 px-4 rounded-xl"
          >
            <Download className="w-4 h-4" />
            <span>Export Data as JSON</span>
          </button>

          <button
            onClick={handleClearData}
            className="flex items-center space-x-2 text-xs py-2 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All My Stored Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
