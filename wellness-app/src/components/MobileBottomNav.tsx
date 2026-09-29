import React from 'react';
import { TabType } from './Navbar';
import { 
  MessageSquare, 
  LayoutDashboard, 
  CheckSquare, 
  HeartHandshake, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { playCompanionBoop } from '../services/soundEffects';

interface MobileBottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isSimpleMode: boolean;
  onToggleSimpleMode: (simple: boolean) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  isSimpleMode,
  onToggleSimpleMode
}) => {
  const handleTabClick = (tab: TabType) => {
    playCompanionBoop();
    if (isSimpleMode) {
      onToggleSimpleMode(false);
    }
    onSelectTab(tab);
  };

  const handleSimpleChatClick = () => {
    playCompanionBoop();
    onToggleSimpleMode(true);
  };

  return (
    <nav 
      data-mobile-only="true"
      className="mobile-bottom-nav-bar md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black px-1.5 py-1.5 shadow-[0px_-3px_0px_#000000] flex items-center justify-around"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%', zIndex: 50 }}
    >
      {/* Simple Chat Tab */}
      <button
        onClick={handleSimpleChatClick}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg border-2 transition-all ${
          isSimpleMode
            ? 'bg-[#facc15] text-black border-black shadow-[2px_2px_0px_#000000] font-black'
            : 'border-transparent text-zinc-600 hover:text-black font-bold'
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-[10px] uppercase font-mono tracking-wider mt-0.5">Chat</span>
      </button>

      {/* Dashboard */}
      <button
        onClick={() => handleTabClick('dashboard')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg border-2 transition-all ${
          !isSimpleMode && currentTab === 'dashboard'
            ? 'bg-black text-white border-black shadow-[2px_2px_0px_#facc15] font-black'
            : 'border-transparent text-zinc-600 hover:text-black font-bold'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="text-[10px] uppercase font-mono tracking-wider mt-0.5">Home</span>
      </button>

      {/* Checkin */}
      <button
        onClick={() => handleTabClick('checkin')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg border-2 transition-all ${
          !isSimpleMode && currentTab === 'checkin'
            ? 'bg-black text-white border-black shadow-[2px_2px_0px_#facc15] font-black'
            : 'border-transparent text-zinc-600 hover:text-black font-bold'
        }`}
      >
        <HeartHandshake className="w-4 h-4" />
        <span className="text-[10px] uppercase font-mono tracking-wider mt-0.5">Check-in</span>
      </button>

      {/* Tasks */}
      <button
        onClick={() => handleTabClick('tasks')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg border-2 transition-all ${
          !isSimpleMode && currentTab === 'tasks'
            ? 'bg-black text-white border-black shadow-[2px_2px_0px_#facc15] font-black'
            : 'border-transparent text-zinc-600 hover:text-black font-bold'
        }`}
      >
        <CheckSquare className="w-4 h-4" />
        <span className="text-[10px] uppercase font-mono tracking-wider mt-0.5">Tasks</span>
      </button>

      {/* Hobbies */}
      <button
        onClick={() => handleTabClick('hobbies')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-lg border-2 transition-all ${
          !isSimpleMode && currentTab === 'hobbies'
            ? 'bg-black text-white border-black shadow-[2px_2px_0px_#facc15] font-black'
            : 'border-transparent text-zinc-600 hover:text-black font-bold'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] uppercase font-mono tracking-wider mt-0.5">Hobbies</span>
      </button>
    </nav>
  );
};
