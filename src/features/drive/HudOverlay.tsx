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

  // 가짜 RPM (종G → 가속 = RPM 높음)
  const fakeRpm = Math.min(8000, Math.max(800, 3000 + gForce.longitudinalG * 5000));
  const rpmPercent = (fakeRpm / 8000) * 100;
  const rpmColor = fakeRpm > 6500 ? '#EF4444' : fakeRpm > 4500 ? '#FF5A00' : '#10B981';

  // 속도 색
  const speedColor =
    speedKmh > 120 ? '#EF4444' :
    speedKmh > 80 ? '#FF5A00' :
    speedKmh > 40 ? '#F59E0B' : '#10B981';

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center select-none"
      style={{ transform: isMirrored ? 'scaleY(-1)' : 'none' }}
    >
      {/* 컨트롤 (미러 시 반전되므로 별도 z-index) */}
      <div className="absolute top-14 right-6 z-50 flex gap-2" style={{ transform: isMirrored ? 'scaleY(-1)' : 'none' }}>
        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
        >
          <FlipVertical size={18} />
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* RPM 바 (상단 가로 전체) */}
      <div className="absolute top-0 left-0 right-0 h-2">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${rpmPercent}%`,
            backgroundColor: rpmColor,
            boxShadow: `0 0 20px ${rpmColor}, 0 0 40px ${rpmColor}40`,
          }}
        />
      </div>

      {/* RPM 숫자 */}
      <div className="absolute top-6 left-6">
        <span className="text-xs font-bold" style={{ color: rpmColor }}>RPM</span>
        <p className="text-2xl font-black text-white tabular-nums" style={{ textShadow: `0 0 20px ${rpmColor}` }}>
          {Math.round(fakeRpm)}
        </p>
      </div>

      {/* G값 (좌상단) */}
      <div className="absolute top-6 right-6">
        <span className="text-xs font-bold text-text-tertiary">G-FORCE</span>
        <p className="text-2xl font-black text-warning tabular-nums text-right" style={{ textShadow: '0 0 15px rgba(245,158,11,0.5)' }}>
          {gForce.totalG.toFixed(2)}
        </p>
      </div>

      {/* 메인 속도 (중앙) */}
      <div className="flex flex-col items-center">
        <span
          className="text-[140px] font-black tabular-nums leading-none"
          style={{
            color: speedColor,
            textShadow: `0 0 60px ${speedColor}60, 0 0 120px ${speedColor}30`,
          }}
        >
          {speedKmh}
        </span>
        <span className="text-3xl font-bold text-white/30 -mt-2">KM/H</span>
      </div>

      {/* 시간 (하단 좌) */}
      <div className="absolute bottom-20 left-8">
        <span className="text-xs font-bold text-text-tertiary">TIME</span>
        <p className="text-xl font-black text-accent-teal tabular-nums">{formatTime(elapsedMs)}</p>
      </div>

      {/* G-Ball (하단 우) */}
      <div className="absolute bottom-16 right-8">
        <GBallWidget gForce={gForce} size={90} />
      </div>

      {/* 방위 표시 (하단 중앙) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <span className="text-xs font-bold text-text-tertiary">HEADING</span>
        <p className="text-lg font-black text-white/60 tabular-nums text-center">{Math.round(heading)}°</p>
      </div>
    </div>
  );
}
