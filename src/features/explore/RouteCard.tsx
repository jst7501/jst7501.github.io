import React from 'react';
import { Route } from '../../types/route';
import { DifficultyBadge } from '../../components/ui/DifficultyBadge';
import { RoadConditionBadge } from '../../components/ui/RoadConditionBadge';
import { Tag } from '../../components/ui/Tag';
import { useLogStore } from '../../store/logStore';
import { Sparkles, MapPin, Clock, Navigation } from 'lucide-react';
import { formatDistance, formatTime } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface RouteCardProps {
  route: Route;
  onClick: () => void;
}

export function RouteCard({ route, onClick }: RouteCardProps) {
  const { logs } = useLogStore();
  const isCompleted = logs.some(log => log.routeId === route.id);


  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative w-full bento-card p-6 mb-6 overflow-hidden cursor-pointer group rounded-[32px]",
        isCompleted ? 'border border-success/30' : ''
      )}
    >
      {/* Dynamic Background Glow mapped to icon colors vaguely */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary rounded-full blur-[80px] opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 -translate-y-1/2 translate-x-1/4" />

      {/* Top row: Badges */}
      <div className="flex justify-between items-start mb-5 relative z-10 w-full">
        <div className="flex gap-2 flex-wrap">
          <DifficultyBadge level={route.difficulty} />
          {route.reports.length > 0 && (
            <RoadConditionBadge condition={route.reports[0].type} />
          )}
        </div>
        
        {isCompleted && (
          <div className="shrink-0 flex items-center gap-1.5 text-success text-[10px] font-black uppercase tracking-wider bg-success/10 px-3 py-1.5 rounded-full border border-success/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            COMPLETED
          </div>
        )}
      </div>

      {/* Title & Icon Area */}
      <div className="flex flex-col gap-4 mb-5 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-black text-white leading-tight mb-1.5 group-hover:text-primary transition-colors">{route.name}</h3>
            <p className="text-sm font-bold text-text-secondary group-hover:text-white transition-colors">
              <span className="text-primary">{route.region}</span> · {route.distanceKm}km
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-bg-surface to-bg-surface-elevated rounded-[20px] flex items-center justify-center text-3xl shrink-0 border border-border-strong shadow-inner group-hover:scale-110 transition-transform duration-500 ease-out">
            <span className="drop-shadow-lg">{route.icon}</span>
          </div>
        </div>
      </div>

      {/* Futuristic Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
         <div className="bg-bg-base/50 rounded-2xl p-3 border border-border-subtle flex flex-col gap-1 items-center justify-center hover:bg-bg-base transition-colors">
           <Navigation size={14} className="text-primary mb-1" />
           <span className="text-white font-bold text-[13px]">{formatDistance(route.distanceKm)}</span>
         </div>
         <div className="bg-bg-base/50 rounded-2xl p-3 border border-border-subtle flex flex-col gap-1 items-center justify-center hover:bg-bg-base transition-colors">
           <Clock size={14} className="text-accent-teal mb-1" />
           <span className="text-white font-bold text-[13px]">{formatTime(route.timeMinutes)}</span>
         </div>
         <div className="bg-bg-base/50 rounded-2xl p-3 border border-border-subtle flex flex-col gap-1 items-center justify-center hover:bg-bg-base transition-colors">
           <MapPin size={14} className="text-accent-purple mb-1" />
           <span className="text-white font-bold text-[13px]">{route.hairpinCount} 코너</span>
         </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar relative z-10">
        {route.tags.map(tag => (
          <Tag key={tag} className="text-[11px] px-3 py-1 bg-black/40 text-text-secondary border-none">#{tag}</Tag>
        ))}
      </div>

      {/* Rating & Review overlay */}
      <div className="absolute bottom-6 right-6 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <span className="text-warning text-sm">⭐️</span>
        <span className="text-white font-bold text-xs">{route.rating.toFixed(1)}</span>
        <span className="text-text-tertiary font-medium text-[10px]">({route.reviewCount})</span>
      </div>
    </div>
  );
}
