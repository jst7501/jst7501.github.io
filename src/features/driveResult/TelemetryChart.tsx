import React, { useRef, useEffect } from 'react';
import { TelemetryPoint } from '../../store/driveStore';
import { speedToColor } from '../../lib/colorUtils';

interface TelemetryChartProps {
  telemetry: TelemetryPoint[];
  height?: number;
}

/**
 * MoTeC 스타일 텔레메트리 꺾은선 그래프
 * 속도(km/h) + 횡 G값을 시계열로 표시
 */
export function TelemetryChart({ telemetry, height = 180 }: TelemetryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const WIDTH = 600;

  useEffect(() => {
    draw();
  }, [telemetry]);

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || telemetry.length < 2) return;

    const w = WIDTH;
    const h = height;
    ctx.clearRect(0, 0, w, h);

    // 배경
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // 그리드
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const maxSpeed = Math.max(...telemetry.map(p => p.speed * 3.6), 1);
    const maxG = Math.max(...telemetry.map(p => Math.abs(p.lateralG)), 0.1);
    const padding = 8;
    const chartW = w - padding * 2;
    const chartH = h - padding * 2 - 16; // bottom labels

    const xForIdx = (i: number) => padding + (i / (telemetry.length - 1)) * chartW;
    const yForSpeed = (s: number) => padding + chartH - (s / maxSpeed) * chartH * 0.9;
    const yForG = (g: number) => padding + chartH - (g / maxG) * chartH * 0.4;

    // 속도 영역 (그라데이션 채우기)
    ctx.beginPath();
    ctx.moveTo(xForIdx(0), yForSpeed(telemetry[0].speed * 3.6));
    for (let i = 1; i < telemetry.length; i++) {
      ctx.lineTo(xForIdx(i), yForSpeed(telemetry[i].speed * 3.6));
    }
    ctx.lineTo(xForIdx(telemetry.length - 1), padding + chartH);
    ctx.lineTo(xForIdx(0), padding + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255, 90, 0, 0.15)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();

    // 속도 선 (속도별 색상 세그먼트)
    for (let i = 1; i < telemetry.length; i++) {
      ctx.beginPath();
      ctx.moveTo(xForIdx(i - 1), yForSpeed(telemetry[i - 1].speed * 3.6));
      ctx.lineTo(xForIdx(i), yForSpeed(telemetry[i].speed * 3.6));
      ctx.strokeStyle = speedToColor(telemetry[i].speed);
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // G값 선 (얇은 노란색 계열)
    ctx.beginPath();
    ctx.moveTo(xForIdx(0), yForG(Math.abs(telemetry[0].lateralG)));
    for (let i = 1; i < telemetry.length; i++) {
      ctx.lineTo(xForIdx(i), yForG(Math.abs(telemetry[i].lateralG)));
    }
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 범례
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#FF5A00';
    ctx.textAlign = 'left';
    ctx.fillText(`Speed (max ${Math.round(maxSpeed)} km/h)`, padding, h - 4);
    ctx.fillStyle = '#F59E0B';
    ctx.textAlign = 'right';
    ctx.fillText(`G-Force (max ${maxG.toFixed(2)}G)`, w - padding, h - 4);

    // Y축 라벨
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'left';
    ctx.font = '8px sans-serif';
    ctx.fillText(`${Math.round(maxSpeed)}`, 4, padding + 10);
    ctx.fillText('0', 4, padding + chartH);
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        padding: 16,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 5, height: 20, background: '#FF5A00', borderRadius: 3, display: 'inline-block', boxShadow: '0 0 10px rgba(255,90,0,0.7)' }} />
        텔레메트리 분석
      </h3>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={height}
        style={{ width: '100%', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', imageRendering: 'auto' }}
      />
    </div>
  );
}
