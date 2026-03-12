import React from 'react';
import { GForceData } from '../../hooks/useDeviceMotion';

interface GBallWidgetProps {
  gForce: GForceData;
  size?: number;
}

/**
 * G-Ball HUD 위젯
 * 원형 타겟 위에 현재 G값을 점으로 표시
 */
export function GBallWidget({ gForce, size = 120 }: GBallWidgetProps) {
  const maxG = 1.5; // 표시 범위 최대 G
  const radius = size / 2;

  // G값을 픽셀 좌표로 변환 (중심이 0,0)
  const clamp = (v: number) => Math.max(-maxG, Math.min(maxG, v));
  const dotX = (clamp(gForce.lateralG) / maxG) * (radius - 10);
  const dotY = -(clamp(gForce.longitudinalG) / maxG) * (radius - 10); // Y 반전

  // G값에 따른 색상
  const totalG = gForce.totalG;
  const color =
    totalG > 1.0 ? '#EF4444' :   // 빨강 — 극한
    totalG > 0.6 ? '#F59E0B' :   // 주황 — 적극적
    totalG > 0.3 ? '#FF5A00' :   // 오렌지 — 보통
    '#10B981';                     // 초록 — 부드러운

  return (
    <div
      className="relative rounded-full border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    >
      {/* 십자선 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-full h-[1px] bg-white/10" />
        <div className="absolute w-[1px] h-full bg-white/10" />
      </div>

      {/* 동심원 (0.5G, 1.0G) */}
      <div
        className="absolute border border-white/5 rounded-full"
        style={{
          width: `${(0.5 / maxG) * 100}%`,
          height: `${(0.5 / maxG) * 100}%`,
          top: `${50 - (0.5 / maxG) * 50}%`,
          left: `${50 - (0.5 / maxG) * 50}%`,
        }}
      />
      <div
        className="absolute border border-white/5 rounded-full"
        style={{
          width: `${(1.0 / maxG) * 100}%`,
          height: `${(1.0 / maxG) * 100}%`,
          top: `${50 - (1.0 / maxG) * 50}%`,
          left: `${50 - (1.0 / maxG) * 50}%`,
        }}
      />

      {/* G-Ball 점 */}
      <div
        className="absolute w-4 h-4 rounded-full transition-all duration-100"
        style={{
          left: `calc(50% + ${dotX}px - 8px)`,
          top: `calc(50% + ${dotY}px - 8px)`,
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}, 0 0 24px ${color}40`,
        }}
      />

      {/* G값 텍스트 */}
      <div className="absolute bottom-1 left-0 right-0 text-center">
        <span className="text-[10px] font-black" style={{ color }}>
          {totalG.toFixed(2)}G
        </span>
      </div>
    </div>
  );
}
