import React, { useState, useEffect } from 'react';
import { PixelCompanion, CompanionType, CompanionEmotion } from './PixelCompanion';
import { formatCompanionLabel } from '../domain/companions';
import { playCompanionBoop } from '../services/soundEffects';
import { X, Heart, Minimize2, Maximize2, Sparkles } from 'lucide-react';

const MINDFUL_REMINDERS = [
  "Take a slow, deep breath 🌱",
  "Remember to drink a glass of water 💧",
  "Resting is part of living well ✨",
  "Roll your shoulders back and relax 🧘",
  "Celebrate small human victories today 🎉",
  "You don't have to carry everything alone 🤍",
  "Look away from the screen for 20 seconds 👁️",
  "Be kind to yourself today. You're doing fine."
];

interface AmbientCompanionWidgetProps {
  companionType: CompanionType;
  onChangeCompanionType?: (type: CompanionType) => void;
}

export const AmbientCompanionWidget: React.FC<AmbientCompanionWidgetProps> = ({
  companionType,
  onChangeCompanionType
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [reminderIndex, setReminderIndex] = useState(0);
  const [emotion, setEmotion] = useState<CompanionEmotion>('idle');
  const [petCount, setPetCount] = useState(0);

  // Cycle mindful thoughts
  useEffect(() => {
    const timer = setInterval(() => {
      setReminderIndex((prev) => (prev + 1) % MINDFUL_REMINDERS.length);
    }, 24000);
    return () => clearInterval(timer);
  }, []);

  const handlePet = () => {
    playCompanionBoop();
    setEmotion('smile');
    setPetCount((prev) => prev + 1);
    setTimeout(() => {
      setEmotion('idle');
    }, 2800);
  };

  const handleNextThought = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCompanionBoop();
    setReminderIndex((prev) => (prev + 1) % MINDFUL_REMINDERS.length);
  };

  if (isClosed) {
    return (
      <button
        data-desktop-only="true"
        onClick={() => setIsClosed(false)}
        className="ambient-companion-widget hidden md:flex fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-3.5 py-2 shadow-md hover:scale-105 transition-all items-center space-x-1.5 text-xs font-semibold"
        title="Summon Ambient Companion"
      >
        <Sparkles className="w-3.5 h-3.5 fill-white" />
        <span>Companion</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div 
        data-desktop-only="true"
        onClick={() => setIsMinimized(false)}
        className="ambient-companion-widget hidden md:flex fixed bottom-6 right-6 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 shadow-md cursor-pointer hover:-translate-y-0.5 transition-all items-center space-x-2.5"
        title="Click to expand companion"
      >
        <div className="bg-slate-50 p-1 border border-slate-200/80 rounded-xl">
          <PixelCompanion type={companionType} emotion="idle" size={32} interactive={false} />
        </div>
        <div className="text-xs font-semibold text-slate-800 pr-1">
          {formatCompanionLabel(companionType)}
        </div>
        <Maximize2 className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
      </div>
    );
  }

  return (
    <div 
      data-desktop-only="true"
      className="ambient-companion-widget hidden md:block fixed bottom-6 right-6 z-40 w-72 sm:w-80 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-lg p-4 transition-all"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-slate-700">
            Quiet Ambient Buddy
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsClosed(true)}
            className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
            title="Close for now"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex items-start space-x-3">
        {/* Companion Avatar */}
        <div 
          onClick={handlePet}
          className="bg-slate-50 p-1.5 border border-slate-200/80 rounded-xl shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
          title="Click to pet your buddy!"
        >
          <PixelCompanion 
            type={companionType} 
            emotion={emotion} 
            size={48} 
            interactive={true} 
            showThoughtBubble={false}
          />
        </div>

        {/* Thought Bubble */}
        <div className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 relative">
          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            "{MINDFUL_REMINDERS[reminderIndex]}"
          </p>
          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-200/60">
            <button
              onClick={handlePet}
              className="flex items-center space-x-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
            >
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span>Pet ({petCount})</span>
            </button>
            <button
              onClick={handleNextThought}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline"
            >
              Next thought →
            </button>
          </div>
        </div>
      </div>

      {/* Quiet Buddy Indicator */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-medium text-slate-700">{formatCompanionLabel(companionType)}</span>
        <span className="text-emerald-700 font-semibold flex items-center gap-1">● Active</span>
      </div>
    </div>
  );
};
