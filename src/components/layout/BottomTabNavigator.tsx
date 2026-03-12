import React from 'react';
import { Compass, MapIcon, Zap, Map as MapTabIcon, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export type TabType = 'explore' | 'map' | 'meetup' | 'log' | 'my';

interface BottomTabNavigatorProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export function BottomTabNavigator({ activeTab, onChangeTab }: BottomTabNavigatorProps) {
  const tabs = [
    { id: 'explore' as TabType, label: '탐색', icon: Compass },
    { id: 'map' as TabType, label: '지도', icon: MapTabIcon },
    { id: 'meetup' as TabType, label: '번개', icon: Zap },
    { id: 'log' as TabType, label: '로그', icon: MapIcon },
    { id: 'my' as TabType, label: '마이', icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 w-full max-w-[480px] mx-auto z-40 px-6 pointer-events-none">
      {/* Floating Dock Container */}
      <div className="pointer-events-auto hyper-glass rounded-full px-2 py-2 flex justify-between items-center relative overflow-hidden group">
        
        {/* Magic lighting blob that follows selection */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-full text-text-secondary transition-all duration-300 animate-press group/btn",
                isActive ? "text-primary" : "hover:text-white"
              )}
            >
              {/* Active Indicator Blob */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-full shadow-[inset_0_0_12px_rgba(255,90,0,0.2)]" />
              )}
              
              <div className="relative z-10">
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={cn("transition-transform duration-300", isActive && "-translate-y-0.5")}
                />
                
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(255,90,0,0.8)]" />
                )}
              </div>
              
              <span className={cn(
                "text-[10px] font-bold z-10 transition-all duration-300",
                isActive ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-1 group-hover/btn:opacity-50"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
