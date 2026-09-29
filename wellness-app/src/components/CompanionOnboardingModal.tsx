import React, { useState } from 'react';
import { PixelCompanion, CompanionType } from './PixelCompanion';
import { playCompanionBoop, playTaskSuccess } from '../services/soundEffects';
import { Sparkles, Check, Heart } from 'lucide-react';

interface CompanionOption {
  type: CompanionType;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  accentBg: string;
}

const COMPANIONS: CompanionOption[] = [
  {
    type: 'cat',
    name: 'Cat',
    emoji: '🐱',
    tagline: 'Quiet & Observant',
    description: 'Purrs softly, listens without judgment, and brings calm to your day.',
    accentBg: '#fed7aa'
  },
  {
    type: 'racoon',
    name: 'Racoon Dog',
    emoji: '🦝',
    tagline: 'Curious & Thoughtful',
    description: 'Gentle bandit mask, playful spirit, and deeply attentive companion.',
    accentBg: '#cbd5e1'
  },
  {
    type: 'puppy',
    name: 'Dog',
    emoji: '🐶',
    tagline: 'Loyal & Cheerful',
    description: 'Floppy ears, warm heart, and always ready to celebrate small wins.',
    accentBg: '#fef08a'
  },
  {
    type: 'trex',
    name: 'T-Rex',
    emoji: '🦖',
    tagline: 'Tiny Arms, Big Heart',
    description: 'Fiercely encouraging, retro dino spikes, and toothy joyful smiles.',
    accentBg: '#bbf7d0'
  }
];

interface CompanionOnboardingModalProps {
  isOpen: boolean;
  onSelectCompanion: (type: CompanionType) => void;
}

export const CompanionOnboardingModal: React.FC<CompanionOnboardingModalProps> = ({
  isOpen,
  onSelectCompanion
}) => {
  const [selected, setSelected] = useState<CompanionType>('cat');

  if (!isOpen) return null;

  const activeCompanion = COMPANIONS.find(c => c.type === selected) || COMPANIONS[0];

  const handleConfirm = () => {
    playTaskSuccess();
    localStorage.setItem('whohum_companion', selected);
    localStorage.setItem('whohum_companion_chosen', 'true');
    onSelectCompanion(selected);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-3 border-black rounded-2xl shadow-[8px_8px_0px_#000000] max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fef08a] border-2 border-black rounded-full text-xs font-mono font-black uppercase mb-1 shadow-[2px_2px_0px_#000000]">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>One-Time Selection</span>
          </div>
          <h2 className="text-2xl font-black text-black tracking-tight">
            Choose Your Quiet Companion
          </h2>
          <p className="text-xs text-zinc-600 font-medium max-w-md mx-auto leading-relaxed">
            Pick your companion once. They will quietly accompany your daily reflections and celebrate your human moments. (You won't be asked again!)
          </p>
        </div>

        {/* Selected Companion Preview Stage */}
        <div className="flex flex-col items-center justify-center py-4 px-6 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000000]" style={{ backgroundColor: activeCompanion.accentBg }}>
          <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000000] mb-3">
            <PixelCompanion 
              type={selected} 
              emotion="smile" 
              size={80} 
              interactive={true} 
            />
          </div>
          <div className="text-center">
            <div className="text-base font-black text-black flex items-center justify-center gap-1.5">
              <span>{activeCompanion.emoji}</span>
              <span>{activeCompanion.name}</span>
            </div>
            <p className="text-xs font-bold text-zinc-700 font-mono mt-0.5">
              {activeCompanion.tagline}
            </p>
            <p className="text-[11px] text-zinc-600 italic mt-1 max-w-xs">
              "{activeCompanion.description}"
            </p>
          </div>
        </div>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COMPANIONS.map((c) => {
            const isSelected = selected === c.type;
            return (
              <button
                key={c.type}
                type="button"
                onClick={() => {
                  setSelected(c.type);
                  playCompanionBoop();
                }}
                className={`p-2.5 border-2 rounded-xl text-center transition-all flex flex-col items-center justify-between space-y-1.5 ${
                  isSelected
                    ? 'border-black bg-black text-white shadow-[3px_3px_0px_#facc15] -translate-y-0.5'
                    : 'border-black bg-zinc-50 hover:bg-zinc-100 text-black shadow-[2px_2px_0px_#000000]'
                }`}
              >
                <div className="p-1 rounded-lg border border-black bg-white">
                  <PixelCompanion type={c.type} emotion="idle" size={32} interactive={false} />
                </div>
                <div className="text-xs font-bold truncate w-full flex items-center justify-center gap-1">
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                </div>
                {isSelected && (
                  <div className="text-[10px] font-mono font-bold bg-[#facc15] text-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
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
          className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-wider font-mono rounded-xl border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center space-x-2"
        >
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>Bond with {activeCompanion.name} & Continue</span>
        </button>
      </div>
    </div>
  );
};
