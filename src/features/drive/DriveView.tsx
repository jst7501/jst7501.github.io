import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Route } from '../../types/route';
import { NaverMap, NaverMapRef, NaverMarkerData } from '../../components/map/NaverMap';
import { GBallWidget } from '../../components/hud/GBallWidget';
import { HudOverlay } from './HudOverlay';
import { DriveStartOverlay } from './DriveStartOverlay';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useDeviceMotion } from '../../hooks/useDeviceMotion';
import { useDriveStore, DriveSessionResult } from '../../store/driveStore';
import { checkCoDriverAlerts, buildCheckpointsFromRoute, resetCoDriver } from '../../lib/coDriver';
import { speedToColor, speedToGlowColor } from '../../lib/colorUtils';
import { X, Pause, Play, Navigation, Timer, Zap, Monitor } from 'lucide-react';

interface DriveViewProps {
  route?: Route;
  onEnd: (result: DriveSessionResult | null) => void;
}

export function DriveView({ route, onEnd }: DriveViewProps) {
  const mapRef = useRef<NaverMapRef>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const telemetryRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const trailSegmentsRef = useRef<any[]>([]);
  const mapReadyRef = useRef(false);

  const [comboPopup, setComboPopup] = useState<string | null>(null);
  const [showHud, setShowHud] = useState(false);
  const [heading, setHeading] = useState(0);
  const [showCountdown, setShowCountdown] = useState(true);

  // ── Hooks ──
  const { position, isTracking, startTracking, stopTracking, error: geoError } = useGeolocation();
  const { acquire: acquireWakeLock, release: releaseWakeLock } = useWakeLock();
  const { gForce, hasPermission, requestPermission } = useDeviceMotion();

  // ── Store ──
  const {
    isActive, isPaused, elapsedMs, currentSpeed, comboCount,
    startDrive, endDrive, pauseDrive, resumeDrive,
    updatePosition, updateGForce, recordTelemetry, tick,
  } = useDriveStore();

  // ── Checkpoints ──
  const checkpoints = useRef(route ? buildCheckpointsFromRoute(route.nodes, route.reports) : []);

  // ── 맵 자동 줌 맞춤: 카운트다운 중 경로에 맞게 fitBounds ──
  useEffect(() => {
    if (!showCountdown) return;
    // 지도가 준비되면 경로에 맞게 줌을 조절
    const timer = setTimeout(() => {
      if (mapRef.current && route?.nodes && route.nodes.length >= 2) {
        const path = route.nodes.map(n => ({ lat: n.lat, lng: n.lng }));
        mapRef.current.fitBoundsToPath(path, 100);
      }
      mapReadyRef.current = true;
    }, 1500); // SDK 로딩 대기
    return () => clearTimeout(timer);
  }, [showCountdown, route]);

  // ── 주행 시작 (카운트다운 완료 후) ──
  const handleStart = useCallback(async () => {
    if (!hasPermission) await requestPermission();

    resetCoDriver();
    startDrive(route?.id || 'free_drive');
    startTracking();
    acquireWakeLock();

    tickRef.current = setInterval(() => tick(), 1000);
    telemetryRef.current = setInterval(() => recordTelemetry(), 1000);

    // 네비처럼 적절한 줌 레벨로 맞춤 (주행용 16~17)
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.setZoom(16);
      }
    }, 300);
  }, [hasPermission, requestPermission, startDrive, route?.id, startTracking, acquireWakeLock, tick, recordTelemetry]);

  // 카운트다운 완료 시
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    handleStart();
  }, [handleStart]);

  // ── 주행 종료 ──
  const handleEnd = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (telemetryRef.current) clearInterval(telemetryRef.current);
    stopTracking();
    releaseWakeLock();
    // 트레일 정리
    trailSegmentsRef.current.forEach(s => { try { s?.setMap?.(null); } catch {} });
    trailSegmentsRef.current = [];
    const result = endDrive();
    onEnd(result);
  }, [stopTracking, releaseWakeLock, endDrive, onEnd]);

  // ── GPS 업데이트 → 속도별 트레일 + heading 회전 ──
  useEffect(() => {
    if (!position || !isActive) return;

    const speed = position.speed || 0;
    updatePosition(position.lat, position.lng, speed, position.heading || 0);

    const newHeading = position.heading || 0;
    setHeading(newHeading);

    // 지도 카메라 추적
    mapRef.current?.panTo(position.lat, position.lng);
    mapRef.current?.updateCarMarker(position.lat, position.lng, speed);

    // ★ 지도 heading 자동 회전 (내 진행 방향)
    try {
      const mapInstance = mapRef.current?.getMapInstance();
      if (mapInstance && newHeading) {
        mapInstance.setOptions({ heading: newHeading });
      }
    } catch {}

    // ★ 속도별 색상 트레일 세그먼트 그리기
    if (prevPosRef.current) {
      try {
        const mapInstance = mapRef.current?.getMapInstance();
        if (mapInstance && window.naver?.maps) {
          const color = speedToColor(speed);
          // 글로우 세그먼트 (두꺼운 반투명)
          const glow = new naver.maps.Polyline({
            map: mapInstance,
            path: [
              new naver.maps.LatLng(prevPosRef.current.lat, prevPosRef.current.lng),
              new naver.maps.LatLng(position.lat, position.lng),
            ],
            strokeColor: color,
            strokeWeight: 12,
            strokeOpacity: 0.15,
            strokeLineCap: 'round',
          });
          // 메인 세그먼트
          const seg = new naver.maps.Polyline({
            map: mapInstance,
            path: [
              new naver.maps.LatLng(prevPosRef.current.lat, prevPosRef.current.lng),
              new naver.maps.LatLng(position.lat, position.lng),
            ],
            strokeColor: color,
            strokeWeight: 5,
            strokeOpacity: 0.9,
            strokeLineCap: 'round',
          });
          trailSegmentsRef.current.push(glow, seg);
        }
      } catch {}
    }
    prevPosRef.current = { lat: position.lat, lng: position.lng };

    // 코 드라이버 체크
    checkCoDriverAlerts(position.lat, position.lng, checkpoints.current);
  }, [position, isActive, updatePosition]);

  // ── G-Force 업데이트 ──
  useEffect(() => {
    if (!isActive) return;
    updateGForce(gForce.lateralG, gForce.longitudinalG);
  }, [gForce, isActive, updateGForce]);

  // 언마운트 정리
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (telemetryRef.current) clearInterval(telemetryRef.current);
    };
  }, []);

  // ── 포맷 헬퍼 ──
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const speedKmh = Math.round((currentSpeed || 0) * 3.6);

  // ── Polyline path ──
  const polylinePath = route?.nodes.map(n => ({ lat: n.lat, lng: n.lng })) || [];
  const center = position
    ? { lat: position.lat, lng: position.lng }
    : polylinePath.length > 0
      ? { lat: polylinePath[0].lat, lng: polylinePath[0].lng }
      : { lat: 37.5665, lng: 126.978 };

  const markers: NaverMarkerData[] = route?.nodes.map(n => ({
    lat: n.lat,
    lng: n.lng,
    label: n.label,
    type: n.type,
  })) || [];

  const speedColor = speedToColor(currentSpeed || 0);
  const edgeGlow = speedToGlowColor(currentSpeed || 0);

  // 속도별 배경 그라데이션 강도
  const speedIntensity = Math.min(1, speedKmh / 150);

  // 카운트다운 오버레이 — 지도를 뒤에 깔아서 자연스럽게 연결
  if (showCountdown) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col">
        {/* 카운트다운 뒤에 지도 미리보기 */}
        <div className="absolute inset-0 opacity-30">
          <NaverMap
            ref={mapRef}
            center={center}
            zoom={14}
            polylinePath={polylinePath}
            polylineColor="#FF5A00"
            polylineWeight={4}
            markers={markers}
            height="100%"
            fitToPath={true}
            className="rounded-none"
          />
        </div>
        <DriveStartOverlay onComplete={handleCountdownComplete} />
      </div>
    );
  }

  // HUD 모드
  if (showHud) {
    return (
      <HudOverlay
        speedKmh={speedKmh}
        gForce={gForce}
        elapsedMs={elapsedMs}
        heading={heading}
        onClose={() => setShowHud(false)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black flex flex-col"
      style={{
        boxShadow: `inset 0 0 80px ${edgeGlow}`,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      
      {/* ── 지도 (상단) ── */}
      <div className="relative flex-1">
        <NaverMap
          ref={mapRef}
          center={center}
          zoom={16}
          polylinePath={polylinePath}
          polylineColor="rgba(255,255,255,0.12)"
          polylineWeight={3}
          markers={markers}
          height="100%"
          fitToPath={false}
          className="rounded-none"
        />

        {/* 상단 오버레이 — 글래스모피즘 */}
        <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-start p-4 pt-14 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <p className="text-[10px] font-bold text-primary tracking-[0.25em] uppercase">LIVE DRIVE</p>
            </div>
            <h2 className="text-lg font-black text-white">{route?.name || '프리 드라이브'}</h2>
          </div>
          <button
            onClick={handleEnd}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(239,68,68,0.4)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* G-Ball (우하단) */}
        <div className="absolute bottom-4 right-4 z-30">
          <GBallWidget gForce={gForce} size={90} />
        </div>

        {/* 속도 오버레이 (좌하단) — 글래스 */}
        <div
          className="absolute bottom-4 left-4 z-30"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 20,
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px ${edgeGlow}`,
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <span
            className="text-3xl font-black tabular-nums"
            style={{
              color: speedColor,
              textShadow: `0 0 20px ${speedColor}60`,
              transition: 'color 0.2s, text-shadow 0.2s',
            }}
          >
            {speedKmh}
          </span>
          <span className="text-xs font-bold text-white/30 ml-1">km/h</span>
        </div>

        {/* 콤보 팝업 — 게임 스타일 */}
        {comboPopup && (
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-40"
            style={{
              animation: 'comboIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div
              style={{
                background: 'rgba(255,90,0,0.9)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontWeight: 900,
                fontSize: 24,
                padding: '12px 32px',
                borderRadius: 9999,
                boxShadow: '0 0 50px rgba(255,90,0,0.6), 0 4px 20px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              {comboPopup}
            </div>
          </div>
        )}

        {/* GPS 에러 */}
        {geoError && (
          <div
            className="absolute top-20 left-4 right-4 z-40"
            style={{
              background: 'rgba(239,68,68,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#EF4444',
              fontSize: 12,
              fontWeight: 700,
              padding: 12,
              borderRadius: 16,
            }}
          >
            ⚠️ {geoError}
          </div>
        )}
      </div>

      {/* ── 하단 대시보드 — 게임 HUD 스타일 ── */}
      {/* ── 하단 대시보드 — M-Performance 대시보드 ── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #0A0A0C 0%, #020202 100%)',
          borderTop: '2px solid rgba(255,255,255,0.05)',
          padding: '20px 20px 32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.8)',
        }}
      >
        {/* M-Stripes 테두리 */}
        <div className="absolute top-0 left-0 w-full h-[3px] flex">
          <div className="h-full w-1/3 bg-[#0092D0]" />
          <div className="h-full w-1/3 bg-[#113162]" />
          <div className="h-full w-1/3 bg-[#FF0000]" />
        </div>

        {/* 배경 다이내믹 글로우 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 blur-[80px]"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${speedColor}20 0%, transparent 80%)`,
            transition: 'background 0.5s ease',
          }}
        />

        {/* 상단 스탯 로우: 경과시간 | G | 콤보 */}
        <div className="relative grid grid-cols-3 gap-3 mb-6">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1">Session</span>
              <span className="text-xl font-black text-white italic tabular-nums">{formatTime(elapsedMs)}</span>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1">Lateral G</span>
              <span className="text-xl font-black text-blue-400 italic tabular-nums">{gForce.totalG.toFixed(2)}</span>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1">Peak G</span>
              <span className="text-xl font-black text-red-500 italic tabular-nums">0.00</span>
           </div>
        </div>

        {/* 메인 속도 센터 : Slanted Typography */}
        <div className="relative flex flex-col items-center mb-6">
           <div className="flex items-baseline gap-2">
              <span 
                className="text-7xl font-black italic tracking-tighter"
                style={{ 
                  color: '#fff',
                  textShadow: `0 0 30px ${speedColor}40`,
                  transition: 'color 0.2s'
                }}
              >
                {speedKmh}
              </span>
              <span className="text-xl font-black text-white/20 italic">KM/H</span>
           </div>
           
           {/* 세그먼트 스피드 마커 (RPM 게이지 느낌) */}
           <div className="mt-3 flex gap-1 w-full max-w-sm h-2.5">
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i}
                  className="flex-1 rounded-[1px] transition-all duration-150"
                  style={{
                    backgroundColor: (speedKmh / 160) * 40 > i 
                      ? (i > 32 ? '#EF4444' : i > 25 ? '#F59E0B' : '#3B82F6')
                      : 'rgba(255,255,255,0.05)',
                    transform: 'skewX(-15deg)',
                    boxShadow: (speedKmh / 160) * 40 > i ? '0 0 8px currentColor' : 'none'
                  }}
                />
              ))}
           </div>
        </div>

        {/* 컨트롤 버튼 그룹 */}
        <div className="relative flex gap-3">
          <button
            onClick={() => isPaused ? resumeDrive() : pauseDrive()}
            className="flex-[1.5] py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm italic tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
          >
            {isPaused ? <><Play size={18} fill="currentColor" /> RESUME</> : <><Pause size={18} fill="currentColor" /> PAUSE</>}
          </button>
          
          <button
            onClick={() => setShowHud(true)}
            className="flex-1 py-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black text-sm italic tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600/20 active:scale-95 transition-all"
          >
            <Monitor size={18} /> HUD
          </button>

          <button
            onClick={handleEnd}
            className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black text-sm italic tracking-widest flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all shadow-[0_10px_30px_rgba(239,68,68,0.3)]"
          >
            FINISH
          </button>
        </div>
      </div>

      {/* 인라인 keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
        @keyframes comboIn {
          0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Glass HUD Stat ── */
function GlassHudStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 14,
        padding: '10px 8px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4, color }}>
        {icon}
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      </div>
      <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', margin: 0 }}>{value}</p>
    </div>
  );
}
