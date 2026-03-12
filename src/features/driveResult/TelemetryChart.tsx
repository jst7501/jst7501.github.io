import React, { useRef, useEffect } from 'react';
import { TelemetryPoint } from '../../store/driveStore';
import { speedToColor } from '../../lib/colorUtils';

interface TelemetryChartProps {
  telemetry: TelemetryPoint[];
  height?: number;
}

/**
 * MoTeC 스타일 고해상도 텔레메트리 차트
 * - 속도(km/h) + 횡 G포스 로깅
 * - 그리드 시스템 & 정밀 인덱싱
 */
export function TelemetryChart({ telemetry, height = 220 }: TelemetryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    draw();
    return () => window.removeEventListener('resize', handleResize);
  }, [telemetry, height]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas || telemetry.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 30, right: 45, bottom: 25, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    // 1. Background Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    
    // Vertical Grids (Time/Distance)
    const gridCount = 8;
    for (let i = 0; i <= gridCount; i++) {
      const x = padding.left + (i / gridCount) * chartW;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();
    }

    // Horizontal Grids
    const hGrids = 4;
    for (let i = 0; i <= hGrids; i++) {
      const y = padding.top + (i / hGrids) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
    }

    const speeds = telemetry.map(p => p.speed * 3.6);
    const gs = telemetry.map(p => Math.abs(p.lateralG));
    const maxSpeed = Math.max(...speeds, 60);
    const maxG = Math.max(...gs, 1.2);

    const getX = (i: number) => padding.left + (i / (telemetry.length - 1)) * chartW;
    const getYSpeed = (s: number) => padding.top + chartH - (s / maxSpeed) * chartH;
    const getYG = (g: number) => padding.top + chartH - (g / maxG) * chartH;

    // 2. Speed Area (Gradient)
    ctx.beginPath();
    ctx.moveTo(getX(0), getYSpeed(speeds[0]));
    for (let i = 1; i < telemetry.length; i++) {
      ctx.lineTo(getX(i), getYSpeed(speeds[i]));
    }
    ctx.lineTo(getX(telemetry.length - 1), padding.top + chartH);
    ctx.lineTo(getX(0), padding.top + chartH);
    ctx.closePath();

    const speedGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    speedGrad.addColorStop(0, 'rgba(255, 90, 0, 0.12)');
    speedGrad.addColorStop(1, 'rgba(255, 90, 0, 0)');
    ctx.fillStyle = speedGrad;
    ctx.fill();

    // 3. Draw Lines
    // Speed Line (Colored by velocity)
    for (let i = 1; i < telemetry.length; i++) {
      ctx.beginPath();
      ctx.moveTo(getX(i - 1), getYSpeed(speeds[i - 1]));
      ctx.lineTo(getX(i), getYSpeed(speeds[i]));
      ctx.strokeStyle = speedToColor(telemetry[i].speed);
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // G-Force Line (Technical Cyan/Yellow)
    ctx.beginPath();
    ctx.setLineDash([4, 2]);
    ctx.moveTo(getX(0), getYG(gs[0]));
    for (let i = 1; i < telemetry.length; i++) {
      ctx.lineTo(getX(i), getYG(gs[i]));
    }
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Labels & Axes
    ctx.font = '800 9px "JetBrains Mono", monospace';
    
    // Left Axis (Speed)
    ctx.fillStyle = '#FF5A00';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(maxSpeed)}`, padding.left - 8, padding.top + 4);
    ctx.fillText('0', padding.left - 8, padding.top + chartH);
    ctx.save();
    ctx.translate(padding.left - 25, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('SPEED (km/h)', 0, 0);
    ctx.restore();

    // Right Axis (G-Force)
    ctx.fillStyle = '#00FFFF';
    ctx.textAlign = 'left';
    ctx.fillText(`${maxG.toFixed(1)}G`, padding.left + chartW + 8, padding.top + 4);
    ctx.fillText('0G', padding.left + chartW + 8, padding.top + chartH);
    ctx.save();
    ctx.translate(padding.left + chartW + 32, padding.top + chartH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('LATERAL G', 0, 0);
    ctx.restore();

    // 5. Min/Max Markers
    const maxSpeedIdx = speeds.indexOf(Math.max(...speeds));
    ctx.beginPath();
    ctx.arc(getX(maxSpeedIdx), getYSpeed(speeds[maxSpeedIdx]), 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#FF5A00';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return (
    <div className="bento-card p-0 overflow-hidden relative group">
      <div className="absolute top-4 left-6 flex items-center gap-3 z-10">
        <div className="w-1.5 h-4 bg-primary rounded-full" />
        <span className="text-[11px] font-black text-white/40 tracking-[0.2em] uppercase">Pro-Telemetry Logs</span>
      </div>
      
      <div className="absolute top-4 right-6 flex items-center gap-4 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-0.5 bg-primary" />
          <span className="text-[9px] font-bold text-white/30">SPEED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-0.5 bg-cyan-400 opacity-50 border-t border-dashed" />
          <span className="text-[9px] font-bold text-white/30">G-FORCE</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
        className="block"
      />

      <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between pointer-events-none">
        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Winding Navi Logging Engine v2.0</span>
        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Sample Rate 10Hz</span>
      </div>
    </div>
  );
}
