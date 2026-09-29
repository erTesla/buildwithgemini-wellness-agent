import React from 'react';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  CheckSquare, 
  Sparkles, 
  Compass, 
  BarChart3, 
  User, 
  Bot
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
    <header className="sticky top-0 z-30 bg-white border-b border-[#dadce0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-9 h-9 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-semibold text-lg shadow-sm">
              W
            </div>
            <div>
              <span className="text-xl font-normal text-[#202124] tracking-tight">
                Wellness & Activity <span className="font-medium text-[#1a73e8]">Agent</span>
              </span>
              <span className="hidden md:inline-block ml-3 px-2 py-0.5 text-xs bg-[#e8f0fe] text-[#1a73e8] rounded-full font-medium">
                Google Material Edition
              </span>
            </div>
          </div>

          {/* User Badge */}
          <div className="hidden sm:flex items-center space-x-2 text-xs text-[#5f6368] bg-[#f8f9fa] border border-[#dadce0] rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1e8e3e]"></span>
            <span>ID: <strong className="text-[#202124]">{userId}</strong></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#1a73e8] text-[#1a73e8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:border-[#dadce0]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
