import React, { useEffect, useRef, useState } from 'react';
import { TelemetryPoint } from '../../store/driveStore';

interface TractionCircleReplayProps {
  telemetry: TelemetryPoint[];
}

/**
 * 마찰원(Traction Circle) 리플레이
 * 가로축=횡G, 세로축=종G, Canvas2D로 점궤적 렌더링
 */
export function TractionCircleReplay({ telemetry }: TractionCircleReplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SIZE = 280;
  const CENTER = SIZE / 2;
  const MAX_G = 1.5;
  const SCALE = (CENTER - 20) / MAX_G;

  // 전체 궤적 그리기
  useEffect(() => {
    drawFrame(telemetry.length - 1);
  }, [telemetry]);

  // 리플레이 애니메이션
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) clearInterval(animRef.current);
      return;
    }

    animRef.current = setInterval(() => {
      setPlayIndex(prev => {
        const next = prev + 1;
        if (next >= telemetry.length) {
          setIsPlaying(false);
          return telemetry.length - 1;
        }
        drawFrame(next);
        return next;
      });
    }, 50); // 20fps 리플레이

    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [isPlaying, telemetry]);

  function drawFrame(upToIndex: number) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // 배경
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // 동심원 (0.5G, 1.0G)
    [0.5, 1.0].forEach(g => {
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, g * SCALE, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 십자선
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(CENTER, 0); ctx.lineTo(CENTER, SIZE);
    ctx.moveTo(0, CENTER); ctx.lineTo(SIZE, CENTER);
    ctx.stroke();

    // 축 라벨
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('가속', CENTER, 14);
    ctx.fillText('감속', CENTER, SIZE - 6);
    ctx.fillText('좌', 10, CENTER + 3);
    ctx.fillText('우', SIZE - 10, CENTER + 3);

    // 궤적 선
    const points = telemetry.slice(0, upToIndex + 1);
    if (points.length < 2) return;

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = CENTER + p.lateralG * SCALE;
      const y = CENTER - p.longitudinalG * SCALE;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(255,90,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 과거 점들 (페이드)
    const trailLen = Math.min(20, points.length);
    for (let i = Math.max(0, points.length - trailLen); i < points.length; i++) {
      const p = points[i];
      const x = CENTER + p.lateralG * SCALE;
      const y = CENTER - p.longitudinalG * SCALE;
      const alpha = 0.1 + (0.9 * (i - (points.length - trailLen)) / trailLen);
      const totalG = Math.sqrt(p.lateralG ** 2 + p.longitudinalG ** 2);
      const color = totalG > 1.0 ? `rgba(239,68,68,${alpha})` 
                   : totalG > 0.5 ? `rgba(255,90,0,${alpha})`
                   : `rgba(16,185,129,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // 현재 점 (글로우)
    if (points.length > 0) {
      const curr = points[points.length - 1];
      const cx = CENTER + curr.lateralG * SCALE;
      const cy = CENTER - curr.longitudinalG * SCALE;
      const totalG = Math.sqrt(curr.lateralG ** 2 + curr.longitudinalG ** 2);
      const mainColor = totalG > 1.0 ? '#EF4444' : totalG > 0.5 ? '#FF5A00' : '#10B981';

      // 글로우
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
      gradient.addColorStop(0, mainColor);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(cx - 12, cy - 12, 24, 24);

      // 점
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setPlayIndex(0);
      setIsPlaying(true);
    }
  };

  // 슬라이더로 수동 탐색
  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value);
    setPlayIndex(idx);
    setIsPlaying(false);
    drawFrame(idx);
  };

  return (
    <div className="bento-card p-6">
      <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
        <span className="w-1.5 h-6 bg-accent-purple rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
        마찰원 리플레이
      </h3>

      <div className="flex flex-col items-center gap-4">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="rounded-[24px] border border-white/10"
        />

        {/* 컨트롤 */}
        <div className="w-full flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors text-sm font-black"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <input
            type="range"
            min={0}
            max={Math.max(telemetry.length - 1, 0)}
            value={playIndex}
            onChange={handleSlider}
            className="flex-1 accent-primary h-1"
          />
          <span className="text-xs text-text-secondary font-bold tabular-nums w-12 text-right">
            {playIndex}/{telemetry.length}
          </span>
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-4 text-[10px] font-bold text-text-tertiary">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> ~0.5G</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> 0.5~1.0G</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /> 1.0G+</span>
        </div>
      </div>
    </div>
  );
}
