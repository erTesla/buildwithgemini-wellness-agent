import React, { useState } from 'react';
import { PixelCompanion } from './PixelCompanion';
import { CompanionType, ALL_COMPANIONS, getCompanionMetadata } from '../domain/companions';
import { playCompanionBoop, playTaskSuccess } from '../services/soundEffects';
import { Sparkles, Check, Heart, User } from 'lucide-react';
import { getCurrentUserName } from '../services/wellnessService';

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
            Pick any name or nickname. It does not need to be unique! By using this name, you can keep updating your reflections, habits, and tasks across visits.
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
                {isSelected && (
                  <div className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                    <Check className="w-2.5 h-2.5" /> Selected
                  </div>
                )}
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
          <Heart className="w-4 h-4 fill-white text-white" />
          <span>Bond with {activeCompanion.name} & Continue</span>
        </button>
      </div>
    </div>
  );
};
