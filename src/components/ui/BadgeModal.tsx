import React, { useEffect, useState } from 'react';
import { Award, Sparkles } from 'lucide-react';
import { useLogStore } from '../../store/logStore';

interface BadgeModalProps {
  badgeId: string | null;
  onClose: () => void;
}

export function BadgeModal({ badgeId, onClose }: BadgeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { availableBadges } = useLogStore();

  useEffect(() => {
    if (badgeId) {
      setIsVisible(true);
      // Auto close MVP
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [badgeId, onClose]);

  if (!badgeId) return null;

  const badge = availableBadges.find(b => b.id === badgeId);
  if (!badge) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Hyper-blur backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsVisible(false)} />

      {/* Radiant Glow Engine behind the badge */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/30 rounded-full blur-[100px] transition-transform duration-1000 ${isVisible ? 'scale-100' : 'scale-50'}`} />

      {/* Cyberpunk Modal Content */}
      <div className="relative text-center hyper-glass p-10 rounded-[40px] border border-primary/30 shadow-[0_0_80px_rgba(255,90,0,0.3)] w-11/12 max-w-[360px] transform transition-transform duration-500 hover:scale-105">
        
        {/* Floating Sparkles */}
        <div className="absolute -top-4 -right-4 text-primary animate-pulse">
          <Sparkles size={32} />
        </div>
        <div className="absolute -bottom-4 -left-4 text-warning animate-pulse delay-150">
          <Sparkles size={24} />
        </div>

        {/* Icon Sphere */}
        <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-bg-surface-elevated to-bg-base rounded-full border-2 border-primary shadow-[0_0_30px_rgba(255,90,0,0.4)] flex items-center justify-center text-6xl">
          {(badge as any).icon}
        </div>
        
        <h3 className="text-sm font-bold text-primary mb-2 tracking-widest uppercase">New Badge Unlocked</h3>
        <h2 className="text-3xl font-black text-white mb-3 text-glow">{badge.name}</h2>
        <p className="text-text-secondary text-sm mb-6">{badge.description}</p>
      </div>
    </div>
  );
}
