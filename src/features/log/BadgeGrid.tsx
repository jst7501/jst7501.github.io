import React from 'react';
import { useLogStore } from '../../store/logStore';
import { Shield, Sparkles } from 'lucide-react';

export function BadgeGrid() {
  const { availableBadges, unlockedBadgeIds } = useLogStore();

  return (
    <div className="bento-card p-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-warning rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            배지 컬렉션
          </h3>
          <p className="text-xs text-text-secondary font-medium pl-3.5">당신의 러너 커리어를 증명하세요</p>
        </div>
        <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          {unlockedBadgeIds.length} <span className="text-text-secondary font-medium">/ {availableBadges.length}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableBadges.map(badge => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          
          return (
            <div 
              key={badge.id}
              className={`relative flex flex-col items-center justify-center p-4 rounded-[24px] border border-border-strong text-center overflow-hidden transition-all duration-500 ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-bg-surface-elevated to-bg-base hover:bg-white/5 border-primary/30 shadow-[inset_0_0_20px_rgba(255,90,0,0.05)] group cursor-pointer hover:border-primary/60' 
                  : 'bg-black/40 grayscale opacity-60'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary rounded-full blur-[30px] opacity-10 group-hover:opacity-30 transition-opacity" />
              )}
              
              <div className={`relative z-10 w-12 h-12 flex items-center justify-center text-3xl mb-3 rounded-full ${isUnlocked ? 'bg-primary/10 text-glow shadow-[0_0_15px_rgba(255,90,0,0.3)]' : 'bg-white/5'}`}>
                {badge.emoji}
                {isUnlocked && <Sparkles className="absolute -top-1 -right-1 text-warning w-3 h-3 animate-pulse" />}
              </div>
              
              <h4 className={`text-[11px] font-black mb-1 relative z-10 ${isUnlocked ? 'text-white' : 'text-text-secondary'}`}>
                {badge.name}
              </h4>
              <p className="text-[9px] text-text-tertiary relative z-10 px-1 leading-tight">
                {badge.description}
              </p>

              {!isUnlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <Shield size={16} className="text-text-tertiary opacity-50 mb-1" />
                  <span className="text-[9px] font-bold text-text-tertiary">미획득</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
