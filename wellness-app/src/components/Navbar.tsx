import { 
  LayoutDashboard, 
  HeartHandshake, 
  CheckSquare, 
  Sparkles, 
  Compass, 
  BarChart3, 
  User, 
  Bot,
  Zap,
  Sliders,
  MessageSquare,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';
import { playCompanionBoop } from '../services/soundEffects';

export type TabType = 'dashboard' | 'checkin' | 'tasks' | 'hobbies' | 'discover' | 'history' | 'profile' | 'assistant';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userId: string;
  isSimpleMode: boolean;
  onToggleSimpleMode: (simple: boolean) => void;
  theme?: 'light' | 'ember';
  onToggleTheme?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  onSelectTab, 
  userId, 
  isSimpleMode, 
  onToggleSimpleMode,
  theme = 'light',
  onToggleTheme,
  soundEnabled = true,
  onToggleSound
}) => {
  const advancedNavItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant' as TabType, label: 'AI Partner', icon: Bot },
    { id: 'checkin' as TabType, label: 'Check-in', icon: HeartHandshake },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
    { id: 'hobbies' as TabType, label: 'Hobbies', icon: Sparkles },
    { id: 'discover' as TabType, label: 'Discover', icon: Compass },
    { id: 'history' as TabType, label: 'Insights', icon: BarChart3 },
    { id: 'profile' as TabType, label: 'Settings', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-black shadow-[0px_4px_0px_#000000]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center gap-1.5 sm:gap-3">
          {/* Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0" onClick={() => onSelectTab('dashboard')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#facc15] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center text-black font-black text-base sm:text-xl shrink-0">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 fill-black" />
            </div>
            <div>
              <span className="text-base sm:text-xl font-black text-black tracking-tight flex items-center gap-1.5 sm:gap-2">
                WHO-HUM <span className="bg-black text-[#facc15] px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs uppercase font-mono tracking-wider hidden md:inline-block">For Humans</span>
              </span>
              <span className="hidden lg:inline-block text-xs font-mono font-bold text-zinc-600">
                {isSimpleMode ? 'Quiet Companion • Natural Daily Logging' : 'Full Telemetry & Health Rhythm'}
              </span>
            </div>
          </div>

          {/* Mode Switcher Pill & Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Simple vs Advanced Toggle */}
            <div className="flex items-center p-0.5 bg-zinc-100 border-2 border-black rounded shadow-[2px_2px_0px_#000000]">
              <button
                type="button"
                onClick={() => onToggleSimpleMode(true)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-black uppercase tracking-wider rounded transition-all flex items-center space-x-1 ${
                  isSimpleMode
                    ? 'bg-[#facc15] text-black border-2 border-black shadow-[1px_1px_0px_#000000]'
                    : 'text-zinc-600 hover:text-black'
                }`}
                title="Simple Mode: clean, distraction-free chat buddy window"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Simple Chat</span>
                <span className="sm:hidden text-[10px] font-bold">Chat</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleSimpleMode(false)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-black uppercase tracking-wider rounded transition-all flex items-center space-x-1 ${
                  !isSimpleMode
                    ? 'bg-black text-white border-2 border-black shadow-[1px_1px_0px_#000000]'
                    : 'text-zinc-600 hover:text-black'
                }`}
                title="Advanced Mode: full metrics, biometrics sliders, tasks & charts"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Advanced View</span>
                <span className="sm:hidden text-[10px] font-bold">Full</span>
              </button>
            </div>

            {/* User ID Badge (Desktop) */}
            <div className="hidden xl:flex items-center space-x-2 text-xs font-mono font-bold text-black bg-[#fef08a] border-2 border-black shadow-[2px_2px_0px_#000000] rounded px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse"></span>
              <span>ID: <strong className="text-black">{userId}</strong></span>
            </div>

            {/* Sound FX Toggle */}
            {onToggleSound && (
              <button
                type="button"
                onClick={() => {
                  playCompanionBoop();
                  onToggleSound();
                }}
                className={`p-1.5 sm:p-2 border-2 border-black rounded shadow-[2px_2px_0px_#000000] transition-all ${
                  soundEnabled ? 'bg-[#bbf7d0] text-black hover:bg-emerald-300' : 'bg-zinc-200 text-zinc-500 hover:text-black'
                }`}
                title={soundEnabled ? 'Mute 8-bit sounds' : 'Enable 8-bit sounds'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            )}

            {/* Theme Toggle (Light / Cozy Ember) */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={() => {
                  playCompanionBoop();
                  onToggleTheme();
                }}
                className={`p-1.5 sm:p-2 border-2 border-black rounded shadow-[2px_2px_0px_#000000] transition-all ${
                  theme === 'ember' ? 'bg-[#facc15] text-black hover:bg-amber-400' : 'bg-white text-black hover:bg-zinc-100'
                }`}
                title={theme === 'ember' ? 'Switch to Light Theme' : 'Switch to Cozy Ember (Night Mode)'}
              >
                {theme === 'ember' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation - Only shown in Advanced Mode on desktop (mobile uses bottom nav) */}
        {!isSimpleMode && (
          <nav className="hidden md:flex space-x-2 overflow-x-auto no-scrollbar py-2">
            {advancedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide border-2 border-black rounded transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-[2px_2px_0px_#facc15] -translate-y-0.5'
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#facc15]' : 'text-black'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
