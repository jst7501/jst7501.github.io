import React, { useRef, useCallback, useMemo } from 'react';
import { DriveSessionResult } from '../../store/driveStore';
import { analyzePersona } from '../../lib/personaEngine';
import { TrajectoryCanvas } from './TrajectoryCanvas';
import { Download, Timer, Activity, Zap, Compass } from 'lucide-react';
import { getStaticMapUrl } from '../../lib/staticMap';
import { deriveAdvancedMetrics } from '../../lib/metrics';

interface ShareCardProps {
  result: DriveSessionResult;
  routeName?: string;
}

/**
 * 인스타 최적화 프로 레이서 공유 카드
 */
export function ShareCard({ result, routeName }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const persona = analyzePersona(result);
  const metrics = useMemo(() => deriveAdvancedMetrics(result), [result]);

  const staticMapUrl = useMemo(() => getStaticMapUrl(result.telemetry, 800, 1000), [result]);

  const maxSpeedKmh = Math.round(result.maxSpeed * 3.6);
  const durationMin = Math.floor(result.durationMs / 60000);
  const durationSec = Math.floor((result.durationMs % 60000) / 1000);
  const durationStr = `${durationMin > 0 ? `${durationMin}m ` : ''}${durationSec}s`;
  
  const date = new Date(result.startTime);
  const dateStr = `${date.getFullYear()}. ${(date.getMonth() + 1).toString().padStart(2, '0')}. ${date.getDate().toString().padStart(2, '0')}`;

  let totalDistKm = 0;
  for (let i = 1; i < result.telemetry.length; i++) {
    totalDistKm += result.telemetry[i].speed;
  }
  totalDistKm = Math.round(totalDistKm / 1000 * 10) / 10;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const mod = await import('html2canvas');
      const html2canvas = mod.default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#010101',
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `winding_pro_${date.getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('캡처 실패:', e);
    }
  }, [date]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── 캡처 카드 본체: 인스타 최적화 4:5 비율 ── */}
      <div
        ref={cardRef}
        style={{
          background: '#010101',
          width: '100%',
          aspectRatio: '4/5',
          borderRadius: 48,
          overflow: 'hidden',
          position: 'relative',
          padding: '48px 36px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0,0,0,1)',
        }}
      >
        {/* 장식용 광원 */}
        <div style={{ position: 'absolute', top: -100, right: -50, width: 350, height: 350, background: persona.color, opacity: 0.12, filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -40, width: 250, height: 250, background: '#00FFFF', opacity: 0.08, filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* ── 상단 정보 ── */}
        <div style={{ position: 'relative', zIndex: 10, marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 950, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
                {dateStr}
              </h1>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.25)', marginTop: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {routeName || 'Free Drive Log'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#FF5A00', letterSpacing: '0.2em' }}>TELEMETRY V2.4</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(255,255,255,0.1)', marginTop: 2 }}>RACING ENGINE</div>
            </div>
          </div>
        </div>

        {/* ── 메인 맵 섹션 ── */}
        <div style={{
          flex: 1,
          borderRadius: 32,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#040404',
          marginBottom: 32,
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        }}>
          {/* TRAJECTORY ANALYSIS 레이블 */}
          <div style={{
            position: 'absolute', top: 20, left: 24, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FFFF] animate-pulse" />
            <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em' }}>TRAJECTORY ANALYSIS</span>
          </div>

          {staticMapUrl && (
             <img 
               src={staticMapUrl} 
               alt="Course Map"
               crossOrigin="anonymous"
               style={{ 
                 position: 'absolute', inset: 0, width: '100%', height: '100%', 
                 objectFit: 'cover', opacity: 1.0, filter: 'grayscale(1) contrast(1.2) brightness(0.7)' 
               }} 
             />
          )}
          
          {/* 어두운 비네팅 오버레이 (궤적 강조용) */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)', zIndex: 1 }} />

          <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none', height: '100%' }}>
            <TrajectoryCanvas telemetry={result.telemetry} width={800} height={1000} />
          </div>
          
          {/* 하단 플로팅 스탯 */}
          <div style={{
            position: 'absolute', bottom: 20, left: 20, right: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            zIndex: 10
          }}>
            <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', padding: '10px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
               <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.4)', marginBottom: 2, letterSpacing: '0.05em' }}>MAX VELOCITY</div>
               <div style={{ fontSize: 28, fontStyle: 'italic', fontWeight: 1000, color: '#fff' }}>{maxSpeedKmh}<span style={{ fontSize: 14, marginLeft: 2, opacity: 0.4 }}>km/h</span></div>
            </div>
            <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', padding: '10px 18px', borderRadius: 16, border: '1px solid rgba(255,90,0,0.25)' }}>
               <div style={{ fontSize: 9, fontWeight: 900, color: '#FF9D00', marginBottom: 2, letterSpacing: '0.05em' }}>PEAK LATERAL G</div>
               <div style={{ fontSize: 28, fontStyle: 'italic', fontWeight: 1000, color: '#fff' }}>{result.maxLateralG.toFixed(2)}<span style={{ fontSize: 14, marginLeft: 2, opacity: 0.4 }}>G</span></div>
            </div>
          </div>
        </div>

        {/* ── 프로 분석 데이터 그리드 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <MiniMetric icon={<Timer size={14} />} label="TIME" value={durationStr} />
          <MiniMetric icon={<Activity size={14} />} label="CORNERS" value={`${metrics.cornerCount}`} />
          <MiniMetric icon={<Zap size={14} />} label="SMOOTH" value={`${metrics.smoothnessScore}%`} />
          <MiniMetric icon={<Compass size={14} />} label="DIST" value={`${totalDistKm}km`} />
        </div>

        {/* ── 페르소나 배너 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 28, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 52, filter: `drop-shadow(0 0 15px ${persona.color}40)` }}>{persona.emoji}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 1000, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{persona.title.toUpperCase()}</h2>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginTop: 3, letterSpacing: '0.05em' }}>{persona.description.toUpperCase()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 1000, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
               <span style={{ color: '#FF5A00' }}>{Math.floor(metrics.intensityScore)}</span>
               <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>PTS</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.15)', marginTop: 2, letterSpacing: '0.1em' }}>SCORE</div>
          </div>
        </div>

        {/* ── 푸터 로고 ── */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 24, height: 24, background: '#FF5A00', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 1000, color: '#000' }}>W</span>
            <span style={{ color: '#fff', fontWeight: 1000, fontSize: 18, letterSpacing: '-0.04em' }}>WINDING NAVI <span style={{ opacity: 0.3, fontWeight: 800 }}>PRO</span></span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.15em' }}>WND.N_LOG_E v2.4</div>
        </div>
      </div>

      {/* ── 이미지 저장 버튼 ── */}
      <button
        onClick={handleDownload}
        className="w-full h-16 rounded-[24px] bg-white text-black font-black text-lg flex items-center justify-center gap-3 shadow-[0_25px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Download size={22} strokeWidth={3} /> EXPORT SHARE CARD
      </button>
    </div>
  );
}

/** 미니 메트릭 컴포넌트 */
function MiniMetric({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#FF5A00', opacity: 0.8 }}>{icon}</span>
        <span style={{ fontSize: 9, fontWeight: 1000, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 1000, color: '#fff', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}
