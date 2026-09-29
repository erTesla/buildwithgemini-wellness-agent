import React, { useState, useEffect } from 'react';
import { PixelCompanion } from './PixelCompanion';
import { CompanionType, ALL_COMPANIONS, getCompanionMetadata } from '../domain/companions';
import { playCompanionBoop, playTaskSuccess } from '../services/soundEffects';
import { Sparkles, Check, Heart, User, CheckCircle2 } from 'lucide-react';
import { getCurrentUserName, checkUserDataExists, UserDataSummary } from '../services/wellnessService';

interface CompanionOnboardingModalProps {
  isOpen: boolean;
  onSelectCompanion: (type: CompanionType, userName?: string) => void;
  initialUserName?: string;
}

export const CompanionOnboardingModal: React.FC<CompanionOnboardingModalProps> = ({
  isOpen,
  onSelectCompanion,
  initialUserName
}) => {
  const [selected, setSelected] = useState<CompanionType>('cat');
  const [userName, setUserName] = useState<string>(() => initialUserName || getCurrentUserName() || '');
  const [userDataSummary, setUserDataSummary] = useState<UserDataSummary | null>(null);
  const [checkingUser, setCheckingUser] = useState<boolean>(false);

  useEffect(() => {
    const trimmed = userName.trim();
    if (!trimmed || trimmed.length < 2) {
      setUserDataSummary(null);
      setCheckingUser(false);
      return;
    }

    setCheckingUser(true);
    const timer = setTimeout(async () => {
      try {
        const summary = await checkUserDataExists(trimmed);
        setUserDataSummary(summary);
        if (summary.exists && summary.savedCompanion) {
          setSelected(summary.savedCompanion);
        }
      } catch (err) {
        console.warn('Error checking existing user in modal:', err);
      } finally {
        setCheckingUser(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [userName]);

  if (!isOpen) return null;

  const activeCompanion = getCompanionMetadata(selected);

  const handleConfirm = () => {
    playTaskSuccess();
    const finalName = userName.trim() || 'Friend';
    localStorage.setItem('whohum_username', finalName);
    localStorage.setItem('whohum_companion', selected);
    localStorage.setItem('whohum_companion_chosen', 'true');
    localStorage.setItem('whohum_onboarding_completed', 'true');
    onSelectCompanion(selected, finalName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-800 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Welcome to Who-Hum</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Choose Your Quiet Companion
          </h2>
          <p className="text-xs text-slate-500 font-normal max-w-md mx-auto leading-relaxed">
            Enter your name and pick your companion. They will quietly accompany your daily reflections and celebrate your human moments!
          </p>
        </div>

        {/* Username Selection Section */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Choose Your Username (Non-Unique)</span>
          </label>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Pick any name or nickname. It does not need to be unique! Entering an existing username will instantly load and connect all reflections, tasks, and routines for that name into this session.
          </p>
          <div className="relative">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alex, Maya, Sam, StarGazer..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              maxLength={30}
            />
          </div>

          {/* Live User Account Status */}
          {checkingUser && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 animate-pulse pt-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Checking account history...</span>
            </div>
          )}

          {!checkingUser && userDataSummary && userDataSummary.exists && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-xs text-emerald-900 flex items-start gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Welcome back, {userName.trim()}!</span>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                    Account Found
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Found {userDataSummary.checkInCount} check-in{userDataSummary.checkInCount === 1 ? '' : 's'} and {userDataSummary.taskCount} task{userDataSummary.taskCount === 1 ? '' : 's'} on record. All your data, preferences, and companion will be restored into this session!
                </p>
              </div>
            </div>
          )}

          {!checkingUser && userName.trim().length >= 2 && userDataSummary && !userDataSummary.exists && (
            <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/90 text-[11px] text-slate-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>New username! A fresh, private wellness space will be created for <strong>{userName.trim()}</strong>.</span>
            </div>
          )}
        </div>

        {/* Selected Companion Preview Stage */}
        <div className="flex flex-col items-center justify-center py-5 px-6 border border-slate-200/80 rounded-2xl shadow-xs bg-gradient-to-b from-slate-50/70 to-emerald-50/30">
          <div className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs mb-3">
            <PixelCompanion 
              type={selected} 
              emotion="smile" 
              size={80} 
              interactive={true} 
            />
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-slate-900 flex items-center justify-center gap-1.5">
              <span>{activeCompanion.emoji}</span>
              <span>{activeCompanion.name}</span>
            </div>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">
              {activeCompanion.tagline}
            </p>
            <p className="text-[11px] text-slate-600 italic mt-1 max-w-xs leading-relaxed">
              "{activeCompanion.description}"
            </p>
          </div>
        </div>

        {/* 6 Choices Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_COMPANIONS.map((c) => {
            const isSelected = selected === c.id;
            const isSavedCompanion = userDataSummary?.savedCompanion === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelected(c.id);
                  playCompanionBoop();
                }}
                className={`p-3 border rounded-2xl text-center transition-all flex flex-col items-center justify-between space-y-2 ${
                  isSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/80 text-emerald-900 shadow-xs -translate-y-0.5 font-semibold'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50/80 text-slate-700 shadow-2xs font-medium'
                }`}
              >
                <div className="p-1.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                  <PixelCompanion type={c.id} emotion="idle" size={32} interactive={false} />
                </div>
                <div className="text-xs truncate w-full flex items-center justify-center gap-1">
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                </div>
                {isSelected ? (
                  <div className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                    <Check className="w-2.5 h-2.5" /> Selected
                  </div>
                ) : isSavedCompanion ? (
                  <div className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5" /> Previous
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="brutalist-btn-primary w-full py-3.5 text-sm font-semibold rounded-2xl shadow-sm flex items-center justify-center space-x-2"
        >
          {userDataSummary?.exists ? (
            <>
              <Sparkles className="w-4 h-4 fill-white text-white" />
              <span>Continue as {userName.trim()} & Restore Session Data</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 fill-white text-white" />
              <span>Bond with {activeCompanion.name} & Continue</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
