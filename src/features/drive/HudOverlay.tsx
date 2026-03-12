import React, { useState } from 'react';
import { GBallWidget } from '../../components/hud/GBallWidget';
import { GForceData } from '../../hooks/useDeviceMotion';
import { Maximize2, FlipVertical } from 'lucide-react';

interface HudOverlayProps {
  speedKmh: number;
  gForce: GForceData;
  elapsedMs: number;
  heading: number;
  onClose: () => void;
}

/**
 * 스포츠카 전면유리 HUD 모드
 * - 검정 배경 + 초대형 속도
 * - RPM 게이지 바 (가속도 기반 가짜)
 * - G-Ball
 * - 미러 모드 (scaleY(-1) → 앞유리 반사)
 */
export function HudOverlay({ speedKmh, gForce, elapsedMs, heading, onClose }: HudOverlayProps) {
  const [isMirrored, setIsMirrored] = useState(false);

  // ── M-Performance 로직 ──
  // 가짜 RPM (가속도 기반)
  const fakeRpm = Math.min(8000, Math.max(800, 3000 + gForce.longitudinalG * 5000));
  const rpmPercent = (fakeRpm / 8000) * 100;
  
  // 가상 기어 단수 (속도 기반)
  const gear = speedKmh === 0 ? 'N' : Math.min(7, Math.floor(speedKmh / 35) + 1);
  
  // 쉬프트 라이트 (레드라인 근접 시)
  const isRedline = fakeRpm > 7000;
  const isNearRedline = fakeRpm > 6000;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center select-none overflow-hidden ${isRedline ? 'animate-pulse-red' : ''}`}
      style={{ transform: isMirrored ? 'scaleY(-1)' : 'none' }}
    >
      {/* ── 배경 데코 (M 트리콜로 흔적) ── */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[120px]" />
      </div>

      {/* ── 컨트롤 버튼 ── */}
      <div className="absolute top-14 right-6 z-50 flex gap-3" style={{ transform: isMirrored ? 'scaleY(-1)' : 'none' }}>
        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <FlipVertical size={20} />
        </button>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* ── 상단 세그먼트 RPM 게이지 (BMW M Style) ── */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-10 flex flex-col items-center">
        <div className="flex gap-1.5 w-full max-w-lg h-5 items-end">
          {Array.from({ length: 20 }).map((_, i) => {
            const stepPercent = (i / 20) * 100;
            const isActive = rpmPercent >= stepPercent;
            const isRedZone = i >= 16;
            const isYellowZone = i >= 12 && i < 16;
            
            let color = 'rgba(255,255,255,0.05)';
            if (isActive) {
              if (isRedZone) color = '#EF4444';
              else if (isYellowZone) color = '#F59E0B';
              else color = '#3B82F6';
            }

            return (
              <div
                key={i}
                className="flex-1 transition-all duration-75"
                style={{
                  height: `${60 + (i * 2)}%`,
                  backgroundColor: color,
                  transform: 'skewX(-20deg)',
                  boxShadow: isActive ? `0 0 15px ${color}80` : 'none',
                  borderRadius: '1px',
                }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between w-full max-w-lg px-2">
           <span className="text-[10px] font-black text-white/20 italic">0</span>
           <span className="text-[10px] font-black text-white/20 italic tracking-widest uppercase">M Performance Dynamics</span>
           <span className="text-[10px] font-black text-red-500/40 italic">8</span>
        </div>
      </div>

      {/* ── 메인 데이터 클러스터 ── */}
      <div className="relative flex flex-col items-center scale-110">
        {/* 기어 표시 */}
        <div className="mb-[-20px] z-10">
          <span className="text-xl font-black text-blue-500 italic mr-2">GEAR</span>
          <span className="text-8xl font-black text-white italic tracking-tighter" style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>
            {gear}
          </span>
        </div>

        {/* 속도 숫자 (Slanted) */}
        <div className="flex items-baseline gap-2">
          <span
            className="text-[180px] font-black tabular-nums leading-none tracking-tighter italic"
            style={{
              color: '#fff',
              textShadow: isRedline ? '0 0 80px rgba(239,68,68,0.5)' : '0 0 40px rgba(255,255,255,0.1)',
              WebkitTextStroke: '1px rgba(255,255,255,0.1)',
            }}
          >
            {speedKmh}
          </span>
          <div className="flex flex-col mb-10">
            <span className="text-4xl font-black text-white/20 italic leading-none">KM/H</span>
            <div className={`h-1.5 w-full mt-2 rounded-full ${isNearRedline ? 'bg-red-500' : 'bg-blue-500'} opacity-50`} />
          </div>
        </div>
      </div>

      {/* ── 하단 분석 레이어 ── */}
      <div className="absolute bottom-16 left-8 right-8 flex justify-between items-end">
        {/* RPM 수치 */}
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-1">Engine Revs</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white italic tabular-nums">{Math.round(fakeRpm)}</span>
            <span className="text-xs font-bold text-white/20 uppercase">RPM</span>
          </div>
        </div>

        {/* G-Ball (M Style) */}
        <div className="relative">
          <div className="absolute -inset-4 bg-blue-500/5 blur-2xl rounded-full" />
          <GBallWidget gForce={gForce} size={110} />
        </div>

        {/* 시간 & 방위 */}
        <div className="flex flex-col text-right">
          <div className="mb-4">
            <span className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-1">Session Time</span>
            <p className="text-2xl font-black text-accent-teal italic tabular-nums leading-none">{formatTime(elapsedMs)}</p>
          </div>
          <div>
            <span className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-1">Heading</span>
            <p className="text-xl font-black text-white italic leading-none">{Math.round(heading)}° <span className="text-[10px] opacity-20 NOT-italic">AZIMUTH</span></p>
          </div>
        </div>
      </div>

      {/* ── 쉬프트 인디케이터 ── */}
      {isNearRedline && (
         <div className="absolute top-0 left-0 right-0 flex justify-center pt-2 gap-1 px-4">
           {Array.from({ length: 12 }).map((_, i) => (
             <div 
               key={i} 
               className={`h-2 flex-1 rounded-full ${i < 4 ? 'bg-yellow-400' : i < 8 ? 'bg-orange-500' : 'bg-red-600'} animate-pulse`}
               style={{ animationDelay: `${i * 0.05}s` }}
             />
           ))}
         </div>
      )}

      <style>{`
        @keyframes pulse-red {
          0%, 100% { box-shadow: inset 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: inset 0 0 100px rgba(239, 68, 68, 0.3); }
        }
        .animate-pulse-red {
          animation: pulse-red 0.5s infinite;
        }
      `}</style>
    </div>
  );
}
