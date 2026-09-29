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
  userName?: string;
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
  userName,
  isSimpleMode, 
  onToggleSimpleMode,
  theme = 'light',
  onToggleTheme,
  soundEnabled = true,
  onToggleSound
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Today', icon: LayoutDashboard },
    { id: 'assistant' as TabType, label: 'Companion Chat', icon: Bot },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
    { id: 'hobbies' as TabType, label: 'Activities & Rest', icon: Sparkles },
    { id: 'history' as TabType, label: 'Insights', icon: BarChart3 },
    { id: 'profile' as TabType, label: 'Settings', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center gap-1.5 sm:gap-3">
          {/* Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0" onClick={() => onSelectTab('dashboard')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-sm shadow-emerald-500/20 flex items-center justify-center text-white shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
                Who-Hum <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium tracking-normal hidden md:inline-block">For Humans</span>
              </span>
              <span className="hidden lg:inline-block text-xs text-slate-500">
                {isSimpleMode ? 'Quiet Companion • Natural Daily Logging' : 'Full Telemetry & Health Rhythm'}
              </span>
            </div>
          </div>

          {/* Mode Switcher Pill & Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Simple vs Advanced Toggle */}
            <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => onToggleSimpleMode(true)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                  isSimpleMode
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simple Mode: clean, distraction-free chat buddy window"
              >
                <MessageSquare className={`w-3.5 h-3.5 ${isSimpleMode ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Simple Chat</span>
                <span className="sm:hidden text-[11px]">Chat</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleSimpleMode(false)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                  !isSimpleMode
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Advanced Mode: full metrics, biometrics sliders, tasks & charts"
              >
                <Sliders className={`w-3.5 h-3.5 ${!isSimpleMode ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Advanced View</span>
                <span className="sm:hidden text-[11px]">Full</span>
              </button>
            </div>

            {/* User ID Badge (Desktop) */}
            <div className="hidden xl:flex items-center space-x-2 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ID: <strong className="text-slate-900 font-semibold">{userId}</strong></span>
            </div>

            {/* Sound FX Toggle */}
            {onToggleSound && (
              <button
                type="button"
                onClick={() => {
                  playCompanionBoop();
                  onToggleSound();
                }}
                className={`p-2 rounded-xl border border-slate-200/80 transition-all ${
                  soundEnabled 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/80 shadow-2xs' 
                    : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
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
                className="p-2 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all"
                title={theme === 'ember' ? 'Switch to Light Theme' : 'Switch to Cozy Ember (Night Mode)'}
              >
                {theme === 'ember' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />}
              </button>
            )}

            {/* User Profile Chip */}
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200/70 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold shadow-2xs transition-all"
              title="Click to view profile & edit username"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[110px]">{userName || 'Friend'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation - Desktop */}
        {!isSimpleMode && (
          <nav className="hidden md:flex items-center space-x-1 overflow-x-auto no-scrollbar py-2.5 border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'hobbies' && currentTab === 'discover');
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
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
