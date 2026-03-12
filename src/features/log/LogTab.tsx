import React from 'react';
import { useLogStore } from '../../store/logStore'; 
import { Route } from '../../types/route';
import { RegionMap } from './RegionMap';
import { BadgeGrid } from './BadgeGrid';
import { Award, Zap, Navigation, Map } from 'lucide-react';
import { formatDistance } from '../../lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function LogTab() {
  // Use logStore directly or routeStore if logs are there (MVP simplifications)
  const { logs, totalDistanceKm } = useLogStore();

  const getRecentLogs = () => {
    return [...logs].sort((a, b) => b.date - a.date).slice(0, 3);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-y-auto hide-scrollbar scroll-smooth">
      {/* Premium Glass Header */}
      <div className="sticky top-0 z-[100] pt-14 pb-5 bg-[#050505]/60 backdrop-blur-3xl border-b border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] px-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black tracking-tighter text-white">
            RUNNER LOG<span className="text-primary">.</span>
          </h2>
          <span className="text-[10px] font-bold text-white/30 tracking-[0.2em] -mt-1 ml-0.5">내 주행 기록</span>
        </div>
      </div>

      <div className="p-6 pb-40 flex flex-col gap-8">
        
        {/* Top Level Stats Bento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bento-card p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 blur-[40px] rounded-full group-hover:bg-primary/40 transition-colors" />
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-text-secondary font-bold text-sm flex items-center gap-1.5 mb-1"><Navigation size={16} className="text-primary" /> 총 누적 주행거리</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{formatDistance(totalDistanceKm)}</h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-bg-surface-elevated to-bg-base border-2 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,90,0,0.3)] text-2xl">
                🏎️
              </div>
            </div>
          </div>

          <div className="bento-card p-5 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/5 transition-colors cursor-default">
            <div className="w-10 h-10 rounded-full bg-accent-teal/10 text-accent-teal flex items-center justify-center mb-1"><Map size={20} /></div>
            <p className="text-xs text-text-secondary font-bold">방문한 지역</p>
            <p className="text-2xl font-black text-white">4<span className="text-sm text-text-tertiary ml-0.5 font-bold">곳</span></p>
          </div>

          <div className="bento-card p-5 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/5 transition-colors cursor-default">
            <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-1"><Award size={20} /></div>
            <p className="text-xs text-text-secondary font-bold">획득한 배지</p>
            <p className="text-2xl font-black text-white">2<span className="text-sm text-text-tertiary ml-0.5 font-bold">개</span></p>
          </div>
        </div>

        {/* Region Discovery */}
        <RegionMap />

        {/* Badge Grid */}
        <BadgeGrid />

        {/* Recent Activity */}
        <div className="bento-card p-6">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-success rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            최근 주행 기록
          </h3>

          <div className="flex flex-col gap-4">
            {logs.length === 0 ? (
               <div className="text-center py-8 bg-bg-surface-elevated rounded-[20px] border border-dashed border-border-strong">
                 <p className="text-text-secondary text-sm font-bold">아직 주행 기록이 없습니다.</p>
                 <p className="text-text-tertiary text-xs mt-1">탐색 탭에서 첫 번재 코스를 완주해 보세요!</p>
               </div>
            ) : (
              getRecentLogs().map(log => (
                <div key={log.id} className="bg-bg-base/60 rounded-[20px] p-4 border border-white/5 flex gap-4 items-center group hover:bg-white/5 transition-colors relative overflow-hidden">
                   <div className="absolute inset-y-0 left-0 w-1 bg-success/50 group-hover:bg-success transition-colors" />
                   <div className="w-12 h-12 rounded-2xl bg-bg-surface-elevated flex items-center justify-center text-2xl border border-border-strong shrink-0 group-hover:scale-110 transition-transform">
                     {log.routeId.includes('doma') ? '⛰️' : '🌲'}
                   </div>
                   <div className="flex-1 min-w-0 pr-2">
                     <h4 className="text-white font-bold text-base truncate mb-0.5 group-hover:text-success transition-colors">
                       {log.routeId.includes('doma') ? '도마령 우회 코스' : '호명산 와인딩 코스'}
                     </h4>
                     <p className="text-xs text-text-secondary font-medium">
                       {format(log.date, 'yyyy.MM.dd HH:mm')} · <span className="text-success">50P 획득</span>
                     </p>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
