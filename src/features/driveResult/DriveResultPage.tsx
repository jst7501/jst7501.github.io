import React, { useMemo } from 'react';
import { DriveSessionResult } from '../../store/driveStore';
import { MOCK_ROUTES } from '../../types/route';
import { ShareCard } from './ShareCard';
import { TelemetryChart } from './TelemetryChart';
import { TractionCircleReplay } from './TractionCircleReplay';
import { SignatureCornerCard } from './SignatureCornerCard';
import { analyzePersona, findSignatureCorner } from '../../lib/personaEngine';
import { ArrowLeft, CheckCircle2, Info } from 'lucide-react';

interface DriveResultPageProps {
  result: DriveSessionResult;
  onClose: () => void;
}

export function DriveResultPage({ result, onClose }: DriveResultPageProps) {
  const route = MOCK_ROUTES.find(r => r.id === result.routeId);
  
  // 분석 엔진 가동
  const persona = useMemo(() => analyzePersona(result), [result]);
  const signatureCorner = useMemo(() => findSignatureCorner(result.telemetry), [result]);

  return (
    <div className="fixed inset-0 z-[150] bg-[#050505] overflow-y-auto hide-scrollbar">
      {/* ── 배경 테마 광원 ── */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% -10%, ${persona.color}15 0%, transparent 70%),
            radial-gradient(circle at 0% 100%, rgba(139,92,246,0.08) 0%, transparent 40%)
          `
        }}
      />

      {/* ── 네비바 ── */}
      <div className="sticky top-0 z-[160] px-6 pt-14 pb-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-2xl hyper-glass flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-primary tracking-[0.2em] mb-0.5">DRIVE LOG</span>
          <span className="text-sm font-bold text-white/40">#{result.startTime.toString().slice(-6)}</span>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      <div className="px-6 pb-40 relative z-10">
        
        {/* ── 1. 프리미엄 공유 카드 (메인) ── */}
        <section className="mb-10">
          <ShareCard result={result} routeName={route?.name} />
          <p className="text-center text-white/20 text-[11px] font-medium mt-4 flex items-center justify-center gap-1.5">
            <Info size={12} /> 위 카드를 즉시 저장하여 SNS에 공유할 수 있습니다
          </p>
        </section>

        {/* ── 2. 상세 데이터 분석 (Bento Section) ── */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white px-1">DETAILED ANALYSIS</h3>

          {/* 텔레메트리 차트 */}
          <div className="bento-card p-6">
             <div className="flex items-center justify-between mb-6">
               <span className="text-xs font-black text-white/30 tracking-widest uppercase">Speed Timeline</span>
               <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">LIVE DATA</span>
             </div>
             <TelemetryChart telemetry={result.telemetry} height={140} />
          </div>

          <div className="grid grid-cols-1 gap-6">
             {/* 마찰원 리플레이 */}
             <div className="bento-card p-4 overflow-hidden">
                <TractionCircleReplay telemetry={result.telemetry} />
             </div>

             {/* 시그니처 코너 */}
             {signatureCorner && (
                <SignatureCornerCard corner={signatureCorner} routeName={route?.name || '프리 드라이브'} />
             )}
          </div>

          {/* 콤보 이벤트 */}
          {result.comboEvents.length > 0 && (
            <div className="bento-card p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <CheckCircle2 size={120} />
               </div>
               <span className="text-xs font-black text-success tracking-[0.2em] uppercase mb-2 block">Smoothness Master</span>
               <div className="flex items-baseline justify-center gap-2">
                 <span className="text-6xl font-black text-white">{result.comboEvents.length}</span>
                 <span className="text-lg font-bold text-white/40">COMBO</span>
               </div>
               <p className="text-white/40 text-sm mt-3 font-medium">부드러운 하중 이동으로 완벽한 코너링을 완성했습니다.</p>
            </div>
          )}
        </div>

        {/* ── 하단 액션 ── */}
        <div className="mt-12 text-center">
           <button
             onClick={onClose}
             className="px-12 py-4 rounded-full glass-frosted text-white/60 font-bold hover:text-white transition-colors"
           >
             메인으로 돌아가기
           </button>
        </div>

      </div>
    </div>
  );
}
