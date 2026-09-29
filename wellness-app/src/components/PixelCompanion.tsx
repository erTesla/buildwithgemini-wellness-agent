import React, { useState, useEffect } from 'react';

export type CompanionType = 'puppy' | 'cat' | 'racoon' | 'trex';
export type CompanionEmotion = 'idle' | 'thinking' | 'smile' | 'sad';

export interface PixelCompanionProps {
  type?: CompanionType;
  emotion?: CompanionEmotion;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showThoughtBubble?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PixelCompanion: React.FC<PixelCompanionProps> = ({
  type = 'puppy',
  emotion = 'idle',
  size = 'md',
  showThoughtBubble = true,
  interactive = true,
  className = '',
  onClick
}) => {
  const [internalEmotion, setInternalEmotion] = useState<CompanionEmotion>(emotion);
  const [isWiggling, setIsWiggling] = useState(false);

  // Sync internal emotion when prop changes
  useEffect(() => {
    setInternalEmotion(emotion);
  }, [emotion]);

  const handleCompanionClick = () => {
    if (!interactive) return;
    setIsWiggling(true);
    setInternalEmotion('smile');
    setTimeout(() => {
      setIsWiggling(false);
      setInternalEmotion(emotion);
    }, 1800);
    if (onClick) onClick();
  };

  // Resolve pixel dimensions
  const pixelSize = typeof size === 'number' 
    ? size 
    : size === 'sm' ? 32 
    : size === 'md' ? 48 
    : size === 'lg' ? 72 
    : 112; // 'xl'

  const activeEmotion = internalEmotion;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleCompanionClick}
      title={interactive ? `Click me! I am your ${type} buddy.` : undefined}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        className={`transition-transform duration-200 ${isWiggling ? 'scale-110' : 'hover:scale-105'}`}
        style={{ shapeRendering: 'crispEdges' }}
      >
        <defs>
          <style>{`
            @keyframes pixelBlink {
              0%, 88%, 100% { transform: scaleY(1); }
              92%, 96% { transform: scaleY(0.1); }
            }
            @keyframes floatDots {
              0%, 100% { opacity: 0.3; transform: translateY(0px); }
              50% { opacity: 1; transform: translateY(-1px); }
            }
            @keyframes gentleBob {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-0.8px); }
            }
            @keyframes earWiggle {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-3deg); }
              75% { transform: rotate(3deg); }
            }
            .animate-blink {
              transform-origin: 12px 11px;
              animation: pixelBlink 3.8s infinite ease-in-out;
            }
            .animate-bob {
              animation: gentleBob 2s infinite ease-in-out;
            }
            .animate-wiggle {
              transform-origin: 12px 18px;
              animation: earWiggle 0.6s infinite ease-in-out;
            }
            .dot-1 { animation: floatDots 1.4s infinite ease-in-out; }
            .dot-2 { animation: floatDots 1.4s infinite ease-in-out 0.25s; }
            .dot-3 { animation: floatDots 1.4s infinite ease-in-out 0.5s; }
          `}</style>
        </defs>

        <g className={activeEmotion === 'thinking' ? 'animate-bob' : activeEmotion === 'smile' ? 'animate-wiggle' : ''}>
          {/* ========================================================== */}
          {/* 1. COMPANION SPECIFIC BODY & EARS                          */}
          {/* ========================================================== */}
          {type === 'puppy' && (
            <g id="puppy-base">
              {/* Head Outline */}
              <rect x="5" y="5" width="14" height="15" fill="#000000" />
              <rect x="4" y="6" width="16" height="13" fill="#000000" />
              
              {/* Head Base - Warm Golden */}
              <rect x="6" y="6" width="12" height="13" fill="#f59e0b" />
              <rect x="5" y="7" width="14" height="11" fill="#f59e0b" />
              
              {/* Forehead Highlight */}
              <rect x="10" y="6" width="4" height="4" fill="#fbbf24" />

              {/* Floppy Puppy Ears */}
              {/* Left Ear */}
              <rect x="2" y="6" width="3" height="7" fill="#000000" />
              <rect x="3" y="7" width="2" height="5" fill="#b45309" />
              {activeEmotion === 'sad' ? (
                // Drooped lower
                <rect x="2" y="10" width="3" height="4" fill="#78350f" />
              ) : (
                <rect x="2" y="7" width="1" height="5" fill="#d97706" />
              )}

              {/* Right Ear */}
              <rect x="19" y="6" width="3" height="7" fill="#000000" />
              <rect x="19" y="7" width="2" height="5" fill="#b45309" />
              {activeEmotion === 'sad' ? (
                <rect x="19" y="10" width="3" height="4" fill="#78350f" />
              ) : (
                <rect x="21" y="7" width="1" height="5" fill="#d97706" />
              )}

              {/* Cream Muzzle / Snout */}
              <rect x="9" y="12" width="6" height="5" fill="#fef3c7" />
              <rect x="8" y="13" width="8" height="3" fill="#fef3c7" />
              
              {/* Black Button Nose */}
              <rect x="11" y="12" width="2" height="2" fill="#000000" />
            </g>
          )}

          {type === 'cat' && (
            <g id="cat-base">
              {/* Pointed Cat Ears */}
              {/* Left Ear */}
              <rect x="4" y="2" width="4" height="5" fill="#000000" />
              <rect x="5" y="3" width="2" height="3" fill="#f472b6" />
              {/* Right Ear */}
              <rect x="16" y="2" width="4" height="5" fill="#000000" />
              <rect x="17" y="3" width="2" height="3" fill="#f472b6" />

              {/* Head Outline */}
              <rect x="4" y="5" width="16" height="14" fill="#000000" />
              <rect x="3" y="7" width="18" height="11" fill="#000000" />
              
              {/* Head Base - Cozy Peach/Ginger */}
              <rect x="5" y="6" width="14" height="12" fill="#fb923c" />
              <rect x="4" y="8" width="16" height="9" fill="#fb923c" />

              {/* Forehead Stripes */}
              <rect x="11" y="6" width="2" height="3" fill="#c2410c" />
              <rect x="9" y="7" width="1" height="2" fill="#c2410c" />
              <rect x="14" y="7" width="1" height="2" fill="#c2410c" />

              {/* Muzzle */}
              <rect x="10" y="13" width="4" height="4" fill="#ffedd5" />
              {/* Tiny Pink Nose */}
              <rect x="11" y="13" width="2" height="1" fill="#ec4899" />

              {/* Whiskers */}
              <rect x="2" y="13" width="3" height="1" fill="#000000" />
              <rect x="2" y="15" width="3" height="1" fill="#000000" />
              <rect x="19" y="13" width="3" height="1" fill="#000000" />
              <rect x="19" y="15" width="3" height="1" fill="#000000" />
            </g>
          )}

          {type === 'racoon' && (
            <g id="raccoon-base">
              {/* Rounded Raccoon Ears with white rims */}
              <rect x="3" y="3" width="5" height="4" fill="#000000" />
              <rect x="4" y="4" width="3" height="2" fill="#f8fafc" />
              <rect x="16" y="3" width="5" height="4" fill="#000000" />
              <rect x="17" y="4" width="3" height="2" fill="#f8fafc" />

              {/* Head Outline */}
              <rect x="4" y="6" width="16" height="14" fill="#000000" />
              <rect x="3" y="7" width="18" height="12" fill="#000000" />

              {/* Head Base - Slate Gray */}
              <rect x="5" y="7" width="14" height="12" fill="#64748b" />
              <rect x="4" y="8" width="16" height="10" fill="#64748b" />

              {/* Iconic Dark Bandit Mask */}
              <rect x="4" y="9" width="16" height="5" fill="#0f172a" />
              {/* White brow accents */}
              <rect x="7" y="8" width="3" height="1" fill="#ffffff" />
              <rect x="14" y="8" width="3" height="1" fill="#ffffff" />

              {/* White Muzzle */}
              <rect x="9" y="13" width="6" height="4" fill="#ffffff" />
              <rect x="10" y="12" width="4" height="2" fill="#ffffff" />
              {/* Black Nose */}
              <rect x="11" y="13" width="2" height="2" fill="#000000" />
            </g>
          )}

          {type === 'trex' && (
            <g id="trex-base">
              {/* Dorsal Spikes (yellow/amber spikes on top of head) */}
              <rect x="5" y="2" width="3" height="3" fill="#000000" />
              <rect x="6" y="3" width="1" height="2" fill="#f59e0b" />
              <rect x="9" y="2" width="3" height="3" fill="#000000" />
              <rect x="10" y="3" width="1" height="2" fill="#f59e0b" />
              <rect x="13" y="3" width="3" height="3" fill="#000000" />
              <rect x="14" y="4" width="1" height="2" fill="#f59e0b" />

              {/* Head & Snout Outline */}
              <rect x="3" y="4" width="18" height="16" fill="#000000" />
              <rect x="2" y="6" width="20" height="13" fill="#000000" />

              {/* Head Base - Dino Green */}
              <rect x="4" y="5" width="16" height="14" fill="#16a34a" />
              <rect x="3" y="7" width="18" height="11" fill="#16a34a" />
              {/* Highlight Ridge */}
              <rect x="5" y="5" width="14" height="2" fill="#22c55e" />

              {/* Underbelly & Lower Jaw - Soft Mint Green */}
              <rect x="7" y="13" width="10" height="5" fill="#86efac" />
              <rect x="8" y="12" width="8" height="2" fill="#86efac" />

              {/* Dino Nostrils */}
              <rect x="5" y="11" width="1" height="1" fill="#14532d" />
              <rect x="18" y="11" width="1" height="1" fill="#14532d" />

              {/* Tiny Cute T-Rex Arms! */}
              <rect x="1" y="14" width="3" height="3" fill="#000000" />
              <rect x="1" y="15" width="2" height="1" fill="#15803d" />
              <rect x="20" y="14" width="3" height="3" fill="#000000" />
              <rect x="21" y="15" width="2" height="1" fill="#15803d" />
            </g>
          )}

          {/* ========================================================== */}
          {/* 2. DYNAMIC EXPRESSIVE EYES                                 */}
          {/* ========================================================== */}

          {/* A. IDLE / NORMAL STATE: Big round eyes with periodic blink */}
          {activeEmotion === 'idle' && (
            <g id="eyes-idle" className="animate-blink">
              {/* Left Eye */}
              <rect x="6" y="9" width="4" height="4" fill="#ffffff" />
              <rect x="7" y="10" width="3" height="3" fill="#000000" />
              <rect x="7" y="10" width="1" height="1" fill="#ffffff" />

              {/* Right Eye */}
              <rect x="14" y="9" width="4" height="4" fill="#ffffff" />
              <rect x="14" y="10" width="3" height="3" fill="#000000" />
              <rect x="14" y="10" width="1" height="1" fill="#ffffff" />
            </g>
          )}

          {/* B. THINKING STATE: Eyes looking UP and to the side */}
          {activeEmotion === 'thinking' && (
            <g id="eyes-thinking">
              {/* Left Eye: Pupil shifted to upper right */}
              <rect x="6" y="9" width="4" height="4" fill="#ffffff" />
              <rect x="8" y="9" width="2" height="3" fill="#000000" />
              <rect x="8" y="9" width="1" height="1" fill="#ffffff" />

              {/* Right Eye: Pupil shifted to upper right */}
              <rect x="14" y="9" width="4" height="4" fill="#ffffff" />
              <rect x="16" y="9" width="2" height="3" fill="#000000" />
              <rect x="16" y="9" width="1" height="1" fill="#ffffff" />

              {/* Curious Eyebrow Arch */}
              <rect x="6" y="8" width="3" height="1" fill="#000000" />
              <rect x="14" y="7" width="3" height="1" fill="#000000" />
            </g>
          )}

          {/* C. SMILING STATE: Eyes squeezed into joyful crescents (^_^), blushing */}
          {activeEmotion === 'smile' && (
            <g id="eyes-smile">
              {/* Left Eye Crescent ^ */}
              <rect x="6" y="11" width="1" height="1" fill="#000000" />
              <rect x="7" y="10" width="2" height="1" fill="#000000" />
              <rect x="9" y="11" width="1" height="1" fill="#000000" />

              {/* Right Eye Crescent ^ */}
              <rect x="14" y="11" width="1" height="1" fill="#000000" />
              <rect x="15" y="10" width="2" height="1" fill="#000000" />
              <rect x="17" y="11" width="1" height="1" fill="#000000" />

              {/* Rosy Blush Cheeks */}
              <rect x="4" y="12" width="2" height="1" fill="#f43f5e" />
              <rect x="18" y="12" width="2" height="1" fill="#f43f5e" />
            </g>
          )}

          {/* D. SAD / CARING STATE: Widened glossy glassy pupils with soft empathy */}
          {activeEmotion === 'sad' && (
            <g id="eyes-sad">
              {/* Left Eye - Large Glossy Pupil */}
              <rect x="6" y="9" width="4" height="4" fill="#ffffff" />
              <rect x="6" y="9" width="4" height="4" fill="#0f172a" />
              {/* Dual glassy light highlights */}
              <rect x="6" y="9" width="2" height="2" fill="#ffffff" />
              <rect x="8" y="11" width="1" height="1" fill="#93c5fd" />

              {/* Right Eye - Large Glossy Pupil */}
              <rect x="14" y="9" width="4" height="4" fill="#ffffff" />
              <rect x="14" y="9" width="4" height="4" fill="#0f172a" />
              <rect x="14" y="9" width="2" height="2" fill="#ffffff" />
              <rect x="16" y="11" width="1" height="1" fill="#93c5fd" />

              {/* Slanted Caring Eyebrows */}
              <rect x="6" y="7" width="2" height="1" fill="#000000" />
              <rect x="8" y="8" width="2" height="1" fill="#000000" />
              <rect x="14" y="8" width="2" height="1" fill="#000000" />
              <rect x="16" y="7" width="2" height="1" fill="#000000" />
            </g>
          )}

          {/* ========================================================== */}
          {/* 3. MOUTH & SMILE DETAILS                                   */}
          {/* ========================================================== */}
          {activeEmotion === 'smile' ? (
            <g id="mouth-smile">
              <rect x="10" y="15" width="4" height="1" fill="#000000" />
              <rect x="11" y="16" width="2" height="1" fill="#000000" />
              {type === 'puppy' && (
                // Happy puppy tongue out!
                <rect x="11" y="16" width="2" height="2" fill="#fb7185" />
              )}
              {type === 'trex' && (
                // Cute little dino teeth!
                <g id="trex-teeth">
                  <rect x="10" y="15" width="1" height="1" fill="#ffffff" />
                  <rect x="13" y="15" width="1" height="1" fill="#ffffff" />
                </g>
              )}
            </g>
          ) : activeEmotion === 'sad' ? (
            <g id="mouth-sad">
              <rect x="11" y="16" width="2" height="1" fill="#000000" />
              <rect x="10" y="17" width="1" height="1" fill="#000000" />
              <rect x="13" y="17" width="1" height="1" fill="#000000" />
            </g>
          ) : (
            <g id="mouth-neutral">
              <rect x="11" y="15" width="2" height="1" fill="#000000" />
            </g>
          )}
        </g>

        {/* ========================================================== */}
        {/* 4. THINKING FLOATING PIXEL DOTS                            */}
        {/* ========================================================== */}
        {activeEmotion === 'thinking' && showThoughtBubble && (
          <g id="thinking-dots">
            <rect x="19" y="3" width="1" height="1" fill="#000000" className="dot-1" />
            <rect x="21" y="1.5" width="1.5" height="1.5" fill="#000000" className="dot-2" />
            <rect x="21" y="1.5" width="0.7" height="0.7" fill="#facc15" className="dot-2" />
            <rect x="18" y="0.5" width="2" height="2" fill="#000000" className="dot-3" />
            <rect x="18.5" y="1" width="1" height="1" fill="#facc15" className="dot-3" />
          </g>
        )}
      </svg>
    </div>
  );
};
