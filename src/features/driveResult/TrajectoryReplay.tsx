import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TelemetryPoint } from '../../store/driveStore';
import { NaverMap, NaverMapRef } from '../../components/map/NaverMap';
import { speedToColor } from '../../lib/colorUtils';
import { Play, Pause, RotateCcw, Globe } from 'lucide-react';

interface TrajectoryReplayProps {
  telemetry: TelemetryPoint[];
}

/**
 * SATELLITE 3D 궤적 리플레이
 * - requestAnimationFrame 기반 부드러운 애니메이션
 * - 위성 지도 + tilt 45° + heading 자동 회전
 * - 속도별 컬러 세그먼트
 */
export function TrajectoryReplay({ telemetry }: TrajectoryReplayProps) {
  const mapRef = useRef<NaverMapRef>(null);
  const segmentsRef = useRef<any[]>([]);
  const carMarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const indexRef = useRef(0);

  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x

  if (telemetry.length < 2) {
    return (
      <div className="bento-card p-6 text-center">
        <p className="text-text-secondary font-bold">텔레메트리 데이터가 부족합니다.</p>
      </div>
    );
  }

  const center = { lat: telemetry[0].lat, lng: telemetry[0].lng };

  function clearAllSegments() {
    segmentsRef.current.forEach(s => { try { s?.setMap?.(null); } catch {} });
    segmentsRef.current = [];
    if (carMarkerRef.current) { try { carMarkerRef.current.setMap(null); } catch {} }
    carMarkerRef.current = null;
  }

  function apply3D() {
    try {
      const m = mapRef.current?.getMapInstance();
      if (m) { m.setMapTypeId('satellite'); m.setOptions({ tilt: 45 }); }
    } catch {}
  }

  function apply2D() {
    try {
      const m = mapRef.current?.getMapInstance();
      if (m) { m.setMapTypeId('normal'); m.setOptions({ tilt: 0, heading: 0 }); }
    } catch {}
  }

  // 세그먼트 한 개 그리기
  const drawSegment = useCallback((idx: number) => {
    if (idx < 1 || idx >= telemetry.length) return;
    const mapInstance = mapRef.current?.getMapInstance();
    if (!mapInstance || !window.naver?.maps) return;

    const prev = telemetry[idx - 1];
    const curr = telemetry[idx];
    const color = speedToColor(curr.speed);

    try {
      // 글로우
      const glow = new naver.maps.Polyline({
        map: mapInstance,
        path: [new naver.maps.LatLng(prev.lat, prev.lng), new naver.maps.LatLng(curr.lat, curr.lng)],
        strokeColor: color, strokeWeight: 10, strokeOpacity: 0.15, strokeLineCap: 'round',
      });
      // 메인 선
      const seg = new naver.maps.Polyline({
        map: mapInstance,
        path: [new naver.maps.LatLng(prev.lat, prev.lng), new naver.maps.LatLng(curr.lat, curr.lng)],
        strokeColor: color, strokeWeight: 4, strokeOpacity: 0.9, strokeLineCap: 'round',
      });
      segmentsRef.current.push(glow, seg);
    } catch {}

    // 카메라 부드럽게 추적
    try { mapRef.current?.panTo(curr.lat, curr.lng); } catch {}

    // 3D heading 회전
    if (is3D) {
      try {
        const dlat = curr.lat - prev.lat;
        const dlng = curr.lng - prev.lng;
        const h = Math.atan2(dlng, dlat) * (180 / Math.PI);
        mapInstance.setOptions({ heading: h });
      } catch {}
    }

    // 차 마커
    try {
      const latlng = new naver.maps.LatLng(curr.lat, curr.lng);
      if (carMarkerRef.current) {
        carMarkerRef.current.setPosition(latlng);
      } else {
        carMarkerRef.current = new naver.maps.Marker({
          position: latlng, map: mapInstance,
          icon: {
            content: `<div style="width:14px;height:14px;background:white;border-radius:50%;border:3px solid ${color};box-shadow:0 0 14px ${color}"></div>`,
            anchor: { x: 7, y: 7 } as any,
          },
        });
      }
    } catch {}
  }, [telemetry, is3D]);

  // ★ requestAnimationFrame 기반 부드러운 재생
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 40 / speed; // ~25fps at 1x, 50fps at 2x

    const animate = (timestamp: number) => {
      if (timestamp - lastTimeRef.current >= intervalMs) {
        lastTimeRef.current = timestamp;
        indexRef.current++;

        if (indexRef.current >= telemetry.length) {
          setIsPlaying(false);
          setPlayIndex(telemetry.length - 1);
          return;
        }

        drawSegment(indexRef.current);
        setPlayIndex(indexRef.current);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, speed, drawSegment, telemetry.length]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (playIndex >= telemetry.length - 1) {
      clearAllSegments();
      indexRef.current = 0;
      setPlayIndex(0);
    }
    if (is3D) apply3D();
    lastTimeRef.current = 0;
    indexRef.current = playIndex;
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    clearAllSegments();
    indexRef.current = 0;
    setPlayIndex(0);
  };

  const toggle3D = () => {
    const next = !is3D;
    setIs3D(next);
    next ? apply3D() : apply2D();
  };

  const cycleSpeed = () => {
    setSpeed(prev => prev >= 4 ? 1 : prev * 2);
  };

  const currSpeed = playIndex < telemetry.length ? Math.round(telemetry[playIndex].speed * 3.6) : 0;
  const currG = playIndex < telemetry.length ? telemetry[playIndex].lateralG : 0;

  return (
    <div className="bento-card p-0 overflow-hidden relative">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(255,90,0,0.8)]" />
          <h3 className="text-base font-black text-white">
            {is3D ? '🛰️ 3D 위성' : '🗺️ 2D'} 궤적 리플레이
          </h3>
        </div>
        <div className="flex gap-4 text-xs font-bold">
          <span style={{ color: speedToColor(telemetry[Math.min(playIndex, telemetry.length - 1)].speed) }}>
            {currSpeed} km/h
          </span>
          <span className="text-warning">{Math.abs(currG).toFixed(2)}G</span>
        </div>
      </div>

      {/* 지도 */}
      <div style={{ height: 360 }}>
        <NaverMap ref={mapRef} center={center} zoom={16} height="360px" fitToPath={false} className="rounded-none" />
      </div>

      {/* 컨트롤 */}
      <div className="bg-[#0A0A0B] p-3 flex items-center gap-2">
        <button onClick={handlePlayPause} className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center">
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={handleReset} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/60 flex items-center justify-center">
          <RotateCcw size={14} />
        </button>
        <input
          type="range" min={0} max={Math.max(telemetry.length - 1, 0)} value={playIndex}
          onChange={(e) => {
            setIsPlaying(false);
            clearAllSegments();
            const idx = parseInt(e.target.value);
            indexRef.current = idx;
            setPlayIndex(idx);
            // 모든 세그먼트 한번에 그리기
            for (let i = 1; i <= idx; i++) drawSegment(i);
          }}
          className="flex-1 accent-primary h-1"
        />
        <button onClick={cycleSpeed}
          className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold min-w-[36px]">
          {speed}x
        </button>
        <button onClick={toggle3D}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${is3D ? 'bg-accent-teal/20 border-accent-teal/30 text-accent-teal' : 'bg-white/5 border-white/10 text-white/60'}`}>
          <Globe size={10} /> {is3D ? '3D' : '2D'}
        </button>
      </div>

      {/* 범례 */}
      <div className="bg-[#0A0A0B] px-4 pb-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-5 text-[9px] font-bold text-text-tertiary">
          <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-success" /> ~30</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-warning" /> ~60</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-primary" /> ~100</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-error" /> 100+</span>
          <span className="text-text-tertiary">km/h</span>
        </div>
      </div>
    </div>
  );
}
