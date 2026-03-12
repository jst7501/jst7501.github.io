import React, { useMemo } from 'react';
import { DriveSessionResult } from '../../store/driveStore';
import { MOCK_ROUTES } from '../../types/route';
import { ShareCard } from './ShareCard';
import { TelemetryChart } from './TelemetryChart';
import { TractionCircleReplay } from './TractionCircleReplay';
import { SignatureCornerCard } from './SignatureCornerCard';
import { analyzePersona, findSignatureCorner } from '../../lib/personaEngine';
import { deriveAdvancedMetrics } from '../../lib/metrics';
import { ArrowLeft, CheckCircle2, Info, Zap } from 'lucide-react';

interface DriveResultPageProps {
  result: DriveSessionResult;
  onClose: () => void;
}

export function DriveResultPage({ result, onClose }: DriveResultPageProps) {
  const route = MOCK_ROUTES.find(r => r.id === result.routeId);
  
  // 분석 엔진 가동
  const persona = useMemo(() => analyzePersona(result), [result]);
  const metrics = useMemo(() => deriveAdvancedMetrics(result), [result]);
  const signatureCorner = useMemo(() => findSignatureCorner(result.telemetry), [result]);

  return (
    <div className="fixed inset-0 z-[150] bg-[#020202] overflow-y-auto hide-scrollbar">
      {/* ── 프로 레이서 다이내믹 메쉬 배경 ── */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, ${persona.color}15 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(0, 255, 255, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(139,92,246,0.05) 0%, transparent 80%)
          `
        }}
      />

      {/* ── 네비바 ── */}
      <div className="sticky top-0 z-[160] px-6 pt-14 pb-4 flex items-center justify-between bg-black/20 backdrop-blur-3xl border-b border-white/5">
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-2xl hyper-glass flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase opacity-70">Log Analyzed</span>
          </div>
          <span className="text-xs font-bold text-white/20">WND-SESSION #{result.startTime.toString().slice(-6)}</span>
        </div>
        <div className="w-12 h-12 flex items-center justify-center">
           <Zap size={20} className="text-primary opacity-50" />
        </div>
      </div>

      <div className="px-6 pb-40 relative z-10 max-w-2xl mx-auto">
        
        {/* ── 1. 프리미엄 공유 카드 (SNS 최적화) ── */}
        <section className="mt-8 mb-12">
          <ShareCard result={result} routeName={route?.name} />
          <p className="text-center text-white/20 text-[10px] font-black tracking-widest mt-6 flex items-center justify-center gap-2 uppercase">
            <Info size={12} className="text-primary" /> INSTAGRAM READY • HQ EXPORT
          </p>
        </section>

        {/* ── 2. 프로페셔널 텔레메트리 대시보드 ── */}
        <div className="space-y-12">
          <div className="flex items-baseline justify-between px-1">
            <div className="flex flex-col">
              <h3 className="text-3xl font-black text-white tracking-tight">DATA INSIGHTS</h3>
              <p className="text-xs font-bold text-white/30 tracking-widest uppercase mt-1">Telemetry Diagnostics v2.4</p>
            </div>
            <div className="text-right">
               <span className="text-4xl font-black text-primary text-glow-primary">{metrics.intensityScore}</span>
               <span className="text-[10px] font-bold text-white/20 block tracking-widest">SCORE</span>
            </div>
          </div>

          {/* 텔레메트리 차트 (확대 버전) */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-cyan-500/10 blur-2xl opacity-40" />
            <TelemetryChart telemetry={result.telemetry} height={300} />
          </div>

          {/* 심화 데이터 그리드 (Pro Metrics) */}
          <div className="grid grid-cols-2 gap-4">
             <DataCard label="TOTAL SECTORS" value={metrics.sectors} unit="SEC" color="#FF5A00" />
             <DataCard label="CORNER COUNT" value={metrics.cornerCount} unit="TURNS" color="#00FFFF" />
             <DataCard label="SUSTAINED G" value={metrics.sustainedGSeconds} unit="SEC" color="#F59E0B" />
             <DataCard label="MAX BRAKING" value={metrics.maxBrakingG.toFixed(2)} unit="G" color="#EF4444" />
             <DataCard label="SMOOTHNESS" value={metrics.smoothnessScore} unit="%" color="#10B981" />
             <DataCard label="AVG LATERAL" value={metrics.avgLateralG.toFixed(2)} unit="G" color="#8B5CF6" />
          </div>

          <div className="grid grid-cols-1 gap-10">
             {/* 마찰원 리플레이 */}
             <div className="bento-card p-6 overflow-hidden min-h-[440px]">
                <div className="flex items-center justify-between mb-8 px-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white/40 tracking-widest uppercase">G-Circle Analysis</span>
                    <span className="text-[10px] font-bold text-white/20 italic">Weight Transfer Dynamics</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">{result.maxLateralG.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-white/20 tracking-tighter uppercase">Peak Lateral</div>
                  </div>
                </div>
                <TractionCircleReplay telemetry={result.telemetry} />
             </div>

             {/* 시그니처 코너 */}
             {signatureCorner && (
                <div className="relative">
                  <SignatureCornerCard corner={signatureCorner} routeName={route?.name || 'FREE SESSION'} />
                </div>
             )}
          </div>
        </div>

        {/* ── 하단 액션 ── */}
        <div className="mt-24 text-center animate-fade-in opacity-0" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
           <button
             onClick={onClose}
             className="px-20 py-6 rounded-3xl glass-frosted text-white/30 font-black text-xs tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all active:scale-95 uppercase border border-white/5"
           >
             Close Session
           </button>
        </div>

      </div>
    </div>
  );
}

/** 데이터 카드 (심화 지표용) */
function DataCard({ label, value, unit, color }: { label: string, value: string | number, unit: string, color: string }) {
  return (
    <div className="bento-card p-6 flex flex-col items-start relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: color }} />
      <span className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-left" style={{ textShadow: `0 0 20px ${color}30` }}>
          {value}
        </span>
        <span className="text-[10px] font-bold text-white/20 uppercase">{unit}</span>
      </div>
    </div>
  );
}
