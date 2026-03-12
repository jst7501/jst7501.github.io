import React from 'react';
import { Route } from '../../types/route';
import { Target, Zap, Clock, Route as RouteIcon, Maximize2 } from 'lucide-react';
import { formatTime } from '../../lib/utils';
import { DifficultyBadge } from '../../components/ui/DifficultyBadge';

interface CourseInfoBoxProps {
  route: Route;
}

export function CourseInfoBox({ route }: CourseInfoBoxProps) {
  return (
    <div className="bento-card p-6">
      <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-accent-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
        코스 스펙
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-bg-base/60 rounded-[20px] p-4 border border-white/5 flex flex-col hover:bg-white/5 transition-colors">
          <div className="text-accent-teal mb-2"><RouteIcon size={20} /></div>
          <p className="text-xs text-text-secondary font-medium mb-1">총 주행거리</p>
          <p className="text-xl font-black text-white">{route.distanceKm}<span className="text-sm font-bold text-text-tertiary ml-0.5">km</span></p>
        </div>
        
        <div className="bg-bg-base/60 rounded-[20px] p-4 border border-white/5 flex flex-col hover:bg-white/5 transition-colors">
          <div className="text-warning mb-2"><Clock size={20} /></div>
          <p className="text-xs text-text-secondary font-medium mb-1">예상 소요시간</p>
          <p className="text-xl font-black text-white">{formatTime(route.timeMinutes)}</p>
        </div>
        
        <div className="bg-bg-base/60 rounded-[20px] p-4 border border-white/5 flex flex-col hover:bg-white/5 transition-colors">
          <div className="text-accent-purple mb-2"><Target size={20} /></div>
          <p className="text-xs text-text-secondary font-medium mb-1">헤어핀 코너</p>
          <p className="text-xl font-black text-white">{route.hairpinCount}<span className="text-sm font-bold text-text-tertiary ml-0.5">개</span></p>
        </div>

        <div className="bg-bg-base/60 rounded-[20px] p-4 border border-white/5 flex flex-col hover:bg-white/5 transition-colors">
          <div className="text-error mb-2"><Zap size={20} /></div>
          <p className="text-xs text-text-secondary font-medium mb-1.5">체감 난이도</p>
          <div>
            <DifficultyBadge level={route.difficulty} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-[20px] border border-primary/20">
        <div className="flex items-center gap-2 mb-2 text-primary font-bold">
          <Maximize2 size={16} /> 베스트 구간
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          이 코스는 특히 중반부 터널 이후 이어지는 연속 S자 헤어핀 구간이 백미입니다. 노면 상태가 훌륭하여 리듬 타기 좋습니다.
        </p>
      </div>
    </div>
  );
}
