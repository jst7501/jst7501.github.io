import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { loadNaverMapSDK } from '../../lib/naverMap';

/* ───── props ───── */
export interface NaverMapProps {
  /** 지도 초기 중심 좌표 */
  center: { lat: number; lng: number };
  /** 초기 줌 레벨 (기본 14) */
  zoom?: number;
  /** Polyline 경로 좌표 배열 */
  polylinePath?: { lat: number; lng: number }[];
  /** Polyline 색상 (기본 #FF5A00) */
  polylineColor?: string;
  /** Polyline 두께 (기본 5) */
  polylineWeight?: number;
  /** 마커 배열 */
  markers?: NaverMarkerData[];
  /** 지도 높이 CSS (기본 100%) */
  height?: string;
  /** 지도를 경로에 맞춰 자동 fit (기본 true) */
  fitToPath?: boolean;
  /** 추가 className */
  className?: string;
}

export interface NaverMarkerData {
  lat: number;
  lng: number;
  label?: string;
  /** 'start' | 'waypoint' | 'end' | 'car' */
  type?: string;
}

/* ───── ref API ───── */
export interface NaverMapRef {
  panTo: (lat: number, lng: number) => void;
  getMapInstance: () => any;
  updateCarMarker: (lat: number, lng: number, speedMs?: number) => void;
  fitBoundsToPath: (path: { lat: number; lng: number }[], padding?: number) => void;
  setZoom: (z: number) => void;
  triggerResize: () => void;
}

/* ───── component ───── */
export const NaverMap = forwardRef<NaverMapRef, NaverMapProps>(function NaverMap(
  {
    center,
    zoom = 14,
    polylinePath,
    polylineColor = '#FF5A00',
    polylineWeight = 5,
    markers,
    height = '100%',
    fitToPath = true,
    className = '',
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const markerRefs = useRef<naver.maps.Marker[]>([]);
  const carMarkerRef = useRef<naver.maps.Marker | null>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  // 1) SDK 로딩
  useEffect(() => {
    loadNaverMapSDK()
      .then(() => setSdkReady(true))
      .catch(() => setSdkError(true));
  }, []);

  // 2) 지도 인스턴스 생성
  useEffect(() => {
    if (!sdkReady || !containerRef.current || mapRef.current) return;

    const map = new naver.maps.Map(containerRef.current, {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom,
      mapTypeId: 'normal',
      zoomControl: false,
      mapDataControl: false,
      scaleControl: false,
      logoControl: true,
      logoControlOptions: { position: 7 },
    });

    mapRef.current = map;

    // 지도 컨테이너 사이즈 변경 감지 (display:none → block 될 때 자동 리사이즈)
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && containerRef.current.offsetWidth > 0) {
        try {
          (map as any).autoResize?.();
          // autoResize가 없으면 setSize로 펴백
          if (typeof (map as any).autoResize !== 'function') {
            const rect = containerRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              (map as any).setSize?.({ width: rect.width, height: rect.height });
            }
          }
        } catch {}
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [sdkReady]);

  // 3) Polyline 렌더링
  useEffect(() => {
    if (!mapRef.current || !polylinePath?.length) return;

    // 기존 polyline 제거
    polylineRef.current?.setMap(null);

    const path = polylinePath.map(p => new naver.maps.LatLng(p.lat, p.lng));

    // 그림자 라인 (두꺼운, 반투명)
    new naver.maps.Polyline({
      map: mapRef.current,
      path,
      strokeColor: polylineColor,
      strokeWeight: polylineWeight + 6,
      strokeOpacity: 0.15,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });

    // 메인 라인
    const polyline = new naver.maps.Polyline({
      map: mapRef.current,
      path,
      strokeColor: polylineColor,
      strokeWeight: polylineWeight,
      strokeOpacity: 0.9,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });

    polylineRef.current = polyline;

    // fitBounds
    if (fitToPath && path.length >= 2) {
      const bounds = new naver.maps.LatLngBounds(path[0], path[0]);
      path.forEach(p => bounds.extend(p));
      mapRef.current.fitBounds(bounds, 60);
    }
  }, [sdkReady, polylinePath, polylineColor, polylineWeight, fitToPath]);

  // 4) 마커 렌더링
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 마커 제거
    markerRefs.current.forEach(m => m.setMap(null));
    markerRefs.current = [];

    markers?.forEach(m => {
      const icon = getMarkerIcon(m.type);
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(m.lat, m.lng),
        map: mapRef.current!,
        icon: {
          content: icon,
          anchor: { x: 16, y: 16 } as any,
        },
        zIndex: m.type === 'start' ? 100 : 50,
      });
      markerRefs.current.push(marker);
    });
  }, [sdkReady, markers]);

  // 5) ref API
  useImperativeHandle(ref, () => ({
    panTo: (lat: number, lng: number) => {
      mapRef.current?.panTo(new naver.maps.LatLng(lat, lng));
    },
    getMapInstance: () => mapRef.current,
    updateCarMarker: (lat: number, lng: number, speedMs?: number) => {
      if (!mapRef.current) return;
      const pos = new naver.maps.LatLng(lat, lng);
      const icon = getCarMarkerIcon(speedMs || 0);
      if (!carMarkerRef.current) {
        carMarkerRef.current = new naver.maps.Marker({
          position: pos,
          map: mapRef.current,
          icon: {
            content: icon,
            anchor: { x: 28, y: 28 } as any,
          },
          zIndex: 200,
        });
      } else {
        carMarkerRef.current.setPosition(pos);
        carMarkerRef.current.setIcon({
          content: icon,
          anchor: { x: 28, y: 28 } as any,
        } as any);
      }
    },
    fitBoundsToPath: (path: { lat: number; lng: number }[], padding?: number) => {
      if (!mapRef.current || !window.naver?.maps || path.length < 2) return;
      const points = path.map(p => new naver.maps.LatLng(p.lat, p.lng));
      const bounds = new naver.maps.LatLngBounds(points[0], points[0]);
      points.forEach(p => bounds.extend(p));
      mapRef.current.fitBounds(bounds, padding ?? 80);
    },
    setZoom: (z: number) => {
      mapRef.current?.setZoom(z);
    },
    triggerResize: () => {
      if (mapRef.current && containerRef.current) {
        try {
          (mapRef.current as any).autoResize?.();
          const rect = containerRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            (mapRef.current as any).setSize?.({ width: rect.width, height: rect.height });
          }
        } catch {}
      }
    },
  }));

  /* ───── fallback UI ───── */
  if (sdkError) {
    return (
      <div className={`relative w-full rounded-[24px] overflow-hidden bg-bg-surface-elevated border border-border-strong flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-6">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-white font-bold text-sm mb-1">네이버 지도를 불러올 수 없습니다</p>
          <p className="text-text-tertiary text-xs">.env 파일에 VITE_NAVER_MAP_CLIENT_ID를 설정하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-[24px] overflow-hidden border border-border-strong ${className}`} style={{ height }}>
      {!sdkReady && (
        <div className="absolute inset-0 bg-bg-surface-elevated flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
});

/* ───── 마커 아이콘 헬퍼 ───── */
function getMarkerIcon(type?: string): string {
  const base = 'display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:14px;font-weight:900;';
  switch (type) {
    case 'start':
      return `<div style="${base}width:32px;height:32px;background:#FF5A00;color:#fff;box-shadow:0 0 12px rgba(255,90,0,0.6);">S</div>`;
    case 'end':
      return `<div style="${base}width:32px;height:32px;background:#10B981;color:#fff;box-shadow:0 0 12px rgba(16,185,129,0.6);">E</div>`;
    case 'waypoint':
      return `<div style="${base}width:24px;height:24px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:2px solid rgba(255,255,255,0.3);color:#fff;font-size:10px;">●</div>`;
    case 'car':
      return getCarMarkerIcon(0);
    default:
      return `<div style="${base}width:20px;height:20px;background:rgba(255,90,0,0.3);border:2px solid #FF5A00;"></div>`;
  }
}

/**
 * 속도 기반 펄싱 차량 마커
 * - 속도가 높을수록 펄스가 빠르고 글로우가 강해짐
 * - 가만히 있어도 기본 heartbeat 효과
 */
function getCarMarkerIcon(speedMs: number): string {
  const kmh = speedMs * 3.6;
  // 속도별 색상
  const color = kmh > 120 ? '#EF4444' : kmh > 80 ? '#FF5A00' : kmh > 40 ? '#F59E0B' : '#FF5A00';
  // 속도별 펄스 속도 (ms)
  const pulseDuration = kmh > 80 ? '0.6s' : kmh > 40 ? '1s' : '1.6s';
  // 속도별 글로우 크기
  const glowSize = kmh > 80 ? 30 : kmh > 40 ? 20 : 14;
  const glowOpacity = kmh > 80 ? 0.7 : kmh > 40 ? 0.5 : 0.3;

  return `
    <div style="position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center;">
      <!-- 오라 펄스 링 (바깥) -->
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        border:2px solid ${color};
        opacity:${glowOpacity};
        animation:carPulse ${pulseDuration} ease-in-out infinite;
      "></div>
      <!-- 오라 펄스 링 (안쪽) -->
      <div style="
        position:absolute;inset:8px;
        border-radius:50%;
        border:1.5px solid ${color};
        opacity:${glowOpacity * 0.6};
        animation:carPulse ${pulseDuration} ease-in-out 0.2s infinite;
      "></div>
      <!-- 메인 아이콘 -->
      <div style="
        position:relative;z-index:2;
        width:32px;height:32px;
        border-radius:50%;
        background:${color};
        color:#fff;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;
        border:3px solid rgba(255,255,255,0.9);
        box-shadow:0 0 ${glowSize}px ${color}, 0 2px 8px rgba(0,0,0,0.5);
        animation:carBreath ${pulseDuration} ease-in-out infinite;
      ">🏎️</div>
      <style>
        @keyframes carPulse {
          0%,100% { transform:scale(0.85); opacity:${glowOpacity}; }
          50% { transform:scale(1.15); opacity:0; }
        }
        @keyframes carBreath {
          0%,100% { transform:scale(1); }
          50% { transform:scale(1.08); }
        }
      </style>
    </div>
  `;
}

