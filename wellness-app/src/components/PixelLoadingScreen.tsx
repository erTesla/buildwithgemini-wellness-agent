import React, { useState, useEffect } from 'react';
import { PixelCompanion, CompanionType } from './PixelCompanion';

interface PixelLoadingScreenProps {
  message?: string;
  defaultType?: CompanionType;
}

export const PixelLoadingScreen: React.FC<PixelLoadingScreenProps> = ({
  message = "Who-Hum is waking up...",
  defaultType = 'puppy'
}) => {
  const [companion, setCompanion] = useState<CompanionType>(defaultType);
  const [dots, setDots] = useState<string>('');
  const [progress, setProgress] = useState<number>(18);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);

    const progInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + Math.floor(Math.random() * 12) + 4 : 92));
    }, 300);

    return () => {
      clearInterval(dotInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] py-16 px-4">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full text-center space-y-6">
        
        {/* Large Pixel Companion in Thinking / Welcoming Motion */}
        <div className="p-5 bg-gradient-to-b from-emerald-50/70 to-teal-50/40 border border-emerald-200/70 rounded-2xl shadow-xs">
          <PixelCompanion 
            type={companion} 
            emotion="thinking" 
            size={96}
            showThoughtBubble={true} 
            interactive={true}
          />
        </div>

        {/* Status Message */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {message}
            <span className="inline-block w-6 text-left">{dots}</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Tuning into your rhythm & preparing your quiet space
          </p>
        </div>

        {/* Clean Modern Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full bg-slate-100 border border-slate-200/80 h-3 p-0.5 rounded-full shadow-inner flex items-center overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
            <span>WHO-HUM COMPANION ENGINE</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Gentle Tip */}
        <p className="text-[11px] text-slate-400 italic">
          💡 Click on your companion to interact!
        </p>
      </div>
    </div>
  );
};
