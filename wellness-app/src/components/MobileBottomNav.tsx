import React from 'react';
import { TabType } from './Navbar';
import { 
  MessageSquare, 
  LayoutDashboard, 
  CheckSquare, 
  Sparkles,
  BarChart3
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
    onToggleSimpleMode(false);
    onSelectTab('assistant');
  };

  return (
    <nav 
      data-mobile-only="true"
      className="mobile-bottom-nav-bar md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg flex items-center justify-around transition-colors"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%', zIndex: 50 }}
    >
      {/* Home */}
      <button
        onClick={() => handleTabClick('dashboard')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
          !isSimpleMode && currentTab === 'dashboard'
            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">Home</span>
      </button>

      {/* Chat */}
      <button
        onClick={handleSimpleChatClick}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
          isSimpleMode || currentTab === 'assistant'
            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">Chat</span>
      </button>

      {/* Tasks */}
      <button
        onClick={() => handleTabClick('tasks')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
          !isSimpleMode && currentTab === 'tasks'
            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <CheckSquare className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">Tasks</span>
      </button>

      {/* Activities & Rest */}
      <button
        onClick={() => handleTabClick('hobbies')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
          !isSimpleMode && (currentTab === 'hobbies' || currentTab === 'discover')
            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">Activities</span>
      </button>

      {/* Insights */}
      <button
        onClick={() => handleTabClick('history')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
          !isSimpleMode && currentTab === 'history'
            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">Insights</span>
      </button>
    </nav>
  );
};
