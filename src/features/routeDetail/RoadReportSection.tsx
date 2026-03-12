import React, { useState } from 'react';
import { RoadReport, RoadConditionType } from '../../types/route';
import { RoadConditionBadge } from '../../components/ui/RoadConditionBadge';
import { AlertTriangle, Clock, MapPin, ChevronRight, Plus } from 'lucide-react';
import { RoadReportSheet } from './RoadReportSheet';
import { useRouteStore } from '../../store/routeStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RoadReportSectionProps {
  routeId: string;
  initialReports: RoadReport[];
}

export function RoadReportSection({ routeId, initialReports }: RoadReportSectionProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Real apps would get from store, simple MVP state override
  const { routes } = useRouteStore();
  const route = routes.find(r => r.id === routeId);
  const reports = route?.reports || initialReports;

  // Active issues
  const latestReports = [...reports].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 3);

  return (
    <div className="bento-card p-6 border-warning/20 relative overflow-hidden group">
      {/* Warning Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-warning rounded-full blur-[60px] opacity-[0.05] group-hover:opacity-[0.15] transition-opacity duration-500 -translate-y-1/2 translate-x-1/2" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-warning rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          위험 노면 제보
        </h3>
        <button 
          onClick={() => setIsSheetOpen(true)}
          className="bg-warning/10 hover:bg-warning/20 text-warning px-3 py-1.5 rounded-full text-xs font-bold border border-warning/30 flex items-center gap-1 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.1)]"
        >
          <Plus size={14} /> 제보
        </button>
      </div>

      <div className="relative z-10">
        {latestReports.length === 0 ? (
          <div className="bg-bg-base/60 rounded-[20px] p-6 text-center border border-white/5">
            <AlertTriangle className="mx-auto text-success/50 mb-3" size={32} />
            <p className="text-white font-bold mb-1">현재 노면 깨끗함</p>
            <p className="text-xs text-text-secondary">최근 등록된 위험 제보가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {latestReports.map(report => (
              <div key={report.id} className="bg-bg-base/60 rounded-[20px] p-4 border border-white/5 flex gap-4 hover:bg-white/5 transition-colors">
                <div className="shrink-0 mt-0.5">
                  <RoadConditionBadge condition={report.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-bold mb-1.5">{report.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-tertiary font-medium">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {report.locationDesc}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true, locale: ko })}</span>
                  </div>
                </div>
              </div>
            ))}
            <button className="flex items-center justify-center gap-1 text-xs text-text-secondary hover:text-white mt-2 font-bold transition-colors">
              전체 제보 목록 보기 <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <RoadReportSheet 
        routeId={routeId}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
