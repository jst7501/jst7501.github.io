import React, { useEffect, useState } from 'react';
import { GForceData } from '../../hooks/useDeviceMotion';

interface GBallWidgetProps {
  gForce: GForceData;
  size?: number;
}

/**
 * Pro Racing G-Ball 위젯
 * - 현재 G값 포인트
 * - G-Trail (과거 궤적)
 * - 중심-포인트 벡터 라인 
 */
export function GBallWidget({ gForce, size = 120 }: GBallWidgetProps) {
  const maxG = 1.6;
  const radius = size / 2;
  const [trail, setTrail] = useState<{ x: number, y: number, opacity: number }[]>([]);

  // G값 픽셀 변환
  const clamp = (v: number) => Math.max(-maxG, Math.min(maxG, v));
  const dotX = (clamp(gForce.lateralG) / maxG) * (radius - 12);
  const dotY = -(clamp(gForce.longitudinalG) / maxG) * (radius - 12);

  // 트레일 업데이트
  useEffect(() => {
    setTrail(prev => {
      const next = [{ x: dotX, y: dotY, opacity: 1 }, ...prev.slice(0, 15)];
      return next.map(p => ({ ...p, opacity: p.opacity * 0.9 }));
    });
  }, [dotX, dotY]);

  const totalG = gForce.totalG;
  const color =
    totalG > 1.2 ? '#EF4444' :
    totalG > 0.8 ? '#FF5A00' :
    totalG > 0.4 ? '#3B82F6' :
    '#10B981';

  return (
    <div
      className="relative rounded-full border border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* 십자 가이드 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-full h-[1px] bg-white/5" />
        <div className="absolute w-[1px] h-full bg-white/5" />
      </div>

      {/* 동심원 (0.5G, 1.0G, 1.5G) */}
      {[0.5, 1.0, 1.5].map(g => (
        <div
          key={g}
          className="absolute border border-white/5 rounded-full"
          style={{
            width: `${(g / maxG) * 100}%`,
            height: `${(g / maxG) * 100}%`,
            top: `${50 - (g / maxG) * 50}%`,
            left: `${50 - (g / maxG) * 50}%`,
          }}
        />
      ))}

      {/* SVG 레이어: 트레일 & 벡터 라인 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        {/* 벡터 라인 */}
        <line
          x1="50%" y1="50%"
          x2={`calc(50% + ${dotX}px)`} y2={`calc(50% + ${dotY}px)`}
          stroke={color}
          strokeWidth="1.5"
          strokeOpacity="0.4"
          strokeDasharray="2,2"
        />
        
        {/* 트레일 도트 */}
        {trail.map((p, i) => (
          <circle
            key={i}
            cx={`calc(50% + ${p.x}px)`}
            cy={`calc(50% + ${p.y}px)`}
            r={1.5 + p.opacity * 2}
            fill={color}
            fillOpacity={p.opacity * 0.3}
          />
        ))}
      </svg>

      {/* 메인 G-Ball 포인트 */}
      <div
        className="absolute w-4 h-4 rounded-full transition-all duration-75 ease-out"
        style={{
          left: `calc(50% + ${dotX}px - 8px)`,
          top: `calc(50% + ${dotY}px - 8px)`,
          background: color,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}40`,
          border: '2px solid rgba(255,255,255,0.4)',
        }}
      />

      {/* G값 텍스트 */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="text-[10px] font-black italic tracking-tighter" style={{ color }}>
          {totalG.toFixed(2)}G
        </span>
      </div>
    </div>
  );
}
