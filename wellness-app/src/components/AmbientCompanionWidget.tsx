import React, { useState, useEffect } from 'react';
import { PixelCompanion, CompanionType, CompanionEmotion } from './PixelCompanion';
import { playCompanionBoop } from '../services/soundEffects';
import { X, MessageCircle, Heart, Minimize2, Maximize2, Sparkles } from 'lucide-react';

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
        onClick={() => setIsClosed(false)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 bg-[#facc15] text-black border-2 border-black rounded-full p-2.5 shadow-[3px_3px_0px_#000000] hover:scale-105 transition-all items-center space-x-1.5 text-xs font-black uppercase font-mono"
        title="Summon Ambient Companion"
      >
        <Sparkles className="w-4 h-4 fill-black" />
        <span>Buddy</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 bg-white border-2 border-black rounded-xl p-2 shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-1 transition-all items-center space-x-2"
        title="Click to expand companion"
      >
        <div className="bg-[#fef08a] p-1 border border-black rounded-lg">
          <PixelCompanion type={companionType} emotion="idle" size={32} interactive={false} />
        </div>
        <div className="text-xs font-black font-mono text-black pr-1">
          Who-Hum
        </div>
        <Maximize2 className="w-3.5 h-3.5 text-zinc-500 hover:text-black" />
      </div>
    );
  }

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-40 w-72 sm:w-80 bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000000] p-4 transition-all">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black" />
          <span className="text-xs font-black uppercase font-mono tracking-wider text-black">
            Quiet Ambient Buddy
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-zinc-100 border border-black rounded text-zinc-600 hover:text-black transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsClosed(true)}
            className="p-1 hover:bg-[#fecaca] border border-black rounded text-zinc-600 hover:text-black transition-colors"
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
          className="bg-[#fef08a] p-1.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000000] cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
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
        <div className="flex-1 bg-[#f8fafc] border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_#000000] relative">
          <p className="text-xs font-medium text-zinc-800 leading-snug">
            "{MINDFUL_REMINDERS[reminderIndex]}"
          </p>
          <div className="mt-2 flex items-center justify-between pt-1 border-t border-zinc-200">
            <button
              onClick={handlePet}
              className="flex items-center space-x-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 font-mono"
            >
              <Heart className="w-3 h-3 fill-rose-500 text-rose-600" />
              <span>Pet ({petCount})</span>
            </button>
            <button
              onClick={handleNextThought}
              className="text-[11px] font-bold text-zinc-600 hover:text-black font-mono underline"
            >
              Next thought →
            </button>
          </div>
        </div>
      </div>

      {/* Quiet Buddy Indicator (non-intrusive) */}
      <div className="mt-2.5 pt-1.5 border-t border-zinc-200 flex items-center justify-between text-[10px] font-mono font-bold text-zinc-400">
        <span>Buddy: {companionType === 'trex' ? '🦖 T-Rex' : companionType === 'cat' ? '🐱 Cat' : companionType === 'racoon' ? '🦝 Racoon Dog' : '🐶 Dog'}</span>
        <span className="text-emerald-600 flex items-center gap-1">● Active</span>
      </div>
    </div>
  );
};
