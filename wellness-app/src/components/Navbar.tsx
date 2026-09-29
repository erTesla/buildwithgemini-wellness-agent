import React from 'react';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  CheckSquare, 
  Sparkles, 
  Compass, 
  BarChart3, 
  User, 
  Bot,
  Zap
} from 'lucide-react';

export type TabType = 'dashboard' | 'checkin' | 'tasks' | 'hobbies' | 'discover' | 'history' | 'profile' | 'assistant';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userId: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, userId }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkin' as TabType, label: 'Check-in', icon: HeartHandshake },
    { id: 'tasks' as TabType, label: 'Tasks & Goals', icon: CheckSquare },
    { id: 'hobbies' as TabType, label: 'Hobbies', icon: Sparkles },
    { id: 'discover' as TabType, label: 'Discover', icon: Compass },
    { id: 'history' as TabType, label: 'Insights', icon: BarChart3 },
    { id: 'assistant' as TabType, label: 'AI Partner', icon: Bot },
    { id: 'profile' as TabType, label: 'Settings', icon: User },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-black shadow-[0px_4px_0px_#000000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded bg-[#facc15] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center text-black font-black text-xl">
              <Zap className="w-6 h-6 fill-black" />
            </div>
            <div>
              <span className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
                WELLNESS <span className="bg-black text-[#facc15] px-1.5 py-0.5 rounded text-sm uppercase">Agent</span>
              </span>
              <span className="hidden md:inline-block text-xs font-mono font-bold text-zinc-600">
                Helium4 Brutalism Edition
              </span>
            </div>
          </div>

          {/* User Badge */}
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono font-bold text-black bg-[#fef08a] border-2 border-black shadow-[2px_2px_0px_#000000] rounded px-3 py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse"></span>
            <span>ID: <strong className="text-black">{userId}</strong></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
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
      </div>
    </header>
  );
};
