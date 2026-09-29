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
      <div className="bg-white border-3 border-black p-8 sm:p-10 rounded-xl shadow-[8px_8px_0px_#000000] flex flex-col items-center max-w-md w-full text-center space-y-6">
        
        {/* Large Pixel Companion in Thinking / Welcoming Motion */}
        <div className="p-4 bg-[#fef08a] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000000]">
          <PixelCompanion 
            type={companion} 
            emotion="thinking" 
            size={96}
            showThoughtBubble={true} 
            interactive={true}
          />
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-black tracking-tight">
            {message}
            <span className="inline-block w-6 text-left">{dots}</span>
          </h3>
          <p className="text-xs font-mono font-bold text-zinc-600">
            Tuning into your rhythm & preparing your quiet space
          </p>
        </div>

        {/* Retro Pixel-Style Segmented Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full bg-zinc-100 border-2 border-black h-5 p-0.5 rounded shadow-[2px_2px_0px_#000000] flex items-center">
            <div 
              className="bg-[#facc15] h-full transition-all duration-300 border-r-2 border-black"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono font-bold text-zinc-500">
            <span>WHO-HUM COMPANION ENGINE</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Gentle Tip */}
        <p className="text-[11px] text-zinc-600 italic">
          💡 Click on your companion to see them smile!
        </p>
      </div>
    </div>
  );
};
