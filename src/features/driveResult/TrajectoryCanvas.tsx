import React, { useRef, useEffect } from 'react';
import { TelemetryPoint } from '../../store/driveStore';
import { speedToColor } from '../../lib/colorUtils';

interface TrajectoryCanvasProps {
  telemetry: TelemetryPoint[];
  width?: number;
  height?: number;
}

/**
 * 프리미엄 캔버스 궤적 렌더러
 * - 어두운 지형 배경 + 노이즈 오버레이
 * - 다중 글로우 레이어
 * - 속도별 네온 컬러 경로
 * - 출발/도착 마커 + 중간 도트
 */
export function TrajectoryCanvas({ telemetry, width = 800, height = 460 }: TrajectoryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    draw();
  }, [telemetry]);

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || telemetry.length < 2) {
      // 데이터 없으면 플레이스홀더
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        const bgGrad = ctx.createRadialGradient(width * 0.4, height * 0.35, 0, width * 0.5, height * 0.5, width * 0.8);
        bgGrad.addColorStop(0, '#1a2332');
        bgGrad.addColorStop(1, '#0a0f15');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('경로 데이터 없음', width / 2, height / 2);
      }
      return;
    }

    const w = width;
    const h = height;
    ctx.clearRect(0, 0, w, h);

    // ── 좌표 계산 ──
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    for (const p of telemetry) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;
    const padding = 60;
    const chartW = w - padding * 2;
    const chartH = h - padding * 2;
    const latScale = chartH / latRange;
    const lngScale = chartW / lngRange;
    const scale = Math.min(latScale, lngScale);
    const offsetX = padding + (chartW - lngRange * scale) / 2;
    const offsetY = padding + (chartH - latRange * scale) / 2;

    const toX = (lng: number) => offsetX + (lng - minLng) * scale;
    const toY = (lat: number) => h - (offsetY + (lat - minLat) * scale);

    // ── 외곽 기본 경로 (어두운 가이드라인) ──
    ctx.beginPath();
    ctx.moveTo(toX(telemetry[0].lng), toY(telemetry[0].lat));
    for (let i = 1; i < telemetry.length; i++) {
      ctx.lineTo(toX(telemetry[i].lng), toY(telemetry[i].lat));
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // ── 속도별 컬러 경로 (Neon Glow System) ──
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1단계: 주변부 광원 (Blurry Outer Glow)
    for (let i = 1; i < telemetry.length; i++) {
      const color = speedToColor(telemetry[i].speed);
      ctx.beginPath();
      ctx.moveTo(toX(telemetry[i - 1].lng), toY(telemetry[i - 1].lat));
      ctx.lineTo(toX(telemetry[i].lng), toY(telemetry[i].lat));
      ctx.strokeStyle = color;
      ctx.lineWidth = 14;
      ctx.globalAlpha = 0.15;
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.stroke();
    }

    // 2단계: 핵심 네온 라인 (Solid Inner Line)
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
    for (let i = 1; i < telemetry.length; i++) {
      const color = speedToColor(telemetry[i].speed);
      ctx.beginPath();
      ctx.moveTo(toX(telemetry[i - 1].lng), toY(telemetry[i - 1].lat));
      ctx.lineTo(toX(telemetry[i].lng), toY(telemetry[i].lat));
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // 3단계: 화이트 코어 (Highlight for extra punch)
    ctx.globalAlpha = 0.4;
    for (let i = 1; i < telemetry.length; i++) {
      ctx.beginPath();
      ctx.moveTo(toX(telemetry[i - 1].lng), toY(telemetry[i - 1].lat));
      ctx.lineTo(toX(telemetry[i].lng), toY(telemetry[i].lat));
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // ── 시작점 (S) ──
    const sx = toX(telemetry[0].lng), sy = toY(telemetry[0].lat);
    drawMarker(ctx, sx, sy, '#10CC81', 'S');

    // ── 종료점 (E) ──
    const last = telemetry[telemetry.length - 1];
    const ex = toX(last.lng), ey = toY(last.lat);
    drawMarker(ctx, ex, ey, '#FF3333', 'E');
  }

  function drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, color: number | string, label: string) {
    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = String(color);
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = String(color);
    ctx.fill();
    
    // Core
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#000';
    ctx.font = 'black 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 0.5);
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'auto' }}
    />
  );
}
