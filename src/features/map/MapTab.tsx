import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NaverMap, NaverMapRef, NaverMarkerData } from '../../components/map/NaverMap';
import { useGeolocation } from '../../hooks/useGeolocation';
import { MOCK_ROUTES, Route } from '../../types/route';
import { Locate, Navigation, ChevronUp, X } from 'lucide-react';

interface MapTabProps {
  onRouteSelect: (routeId: string) => void;
  onStartFreeDrive: () => void;
}

export function MapTab({ onRouteSelect, onStartFreeDrive }: MapTabProps) {
  const mapRef = useRef<NaverMapRef>(null);
  const { position, startTracking, isTracking } = useGeolocation();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // GPS 시작
  useEffect(() => {
    if (!isTracking) startTracking();
  }, []);

  // 위치 마커 업데이트
  useEffect(() => {
    if (position) {
      mapRef.current?.updateCarMarker(position.lat, position.lng);
    }
  }, [position]);

  // 내 위치로 이동
  const handleLocate = useCallback(() => {
    if (position) {
      setIsLocating(true);
      mapRef.current?.panTo(position.lat, position.lng);
      setTimeout(() => setIsLocating(false), 1000);
    }
  }, [position]);

  // 코스 마커 데이터 — 모든 코스의 첫 노드를 마커로 표시
  const courseMarkers: NaverMarkerData[] = MOCK_ROUTES
    .filter(r => r.nodes.length > 0)
    .map(r => ({
      lat: r.nodes[0].lat,
      lng: r.nodes[0].lng,
      label: r.name,
      type: 'start',
    }));

  // 기본 중심 (서울 / GPS가 있으면 현위치)
  const defaultCenter = position 
    ? { lat: position.lat, lng: position.lng }
    : { lat: 37.5665, lng: 126.978 };

  return (
    <div className="relative h-full w-full">
      {/* 전체 화면 지도 */}
      <NaverMap
        ref={mapRef}
        center={defaultCenter}
        zoom={12}
        markers={courseMarkers}
        height="100%"
        fitToPath={false}
        className="rounded-none"
      />

      {/* 내 위치 버튼 (우하단) */}
      <div className="absolute bottom-40 right-4 z-30 flex flex-col gap-3">
        <button
          onClick={handleLocate}
          className={`w-12 h-12 rounded-full bg-bg-surface-elevated/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-white/10 transition-all ${isLocating ? 'animate-pulse text-primary' : ''}`}
        >
          <Locate size={22} />
        </button>
      </div>

      {/* 바로 주행 시작 버튼 (하단 중앙) */}
      <div className="absolute bottom-28 left-4 right-4 z-30">
        <button
          onClick={onStartFreeDrive}
          className="w-full py-4 rounded-[24px] bg-gradient-to-r from-primary to-[#FFCC00] text-white font-black text-lg shadow-[0_10px_30px_rgba(255,90,0,0.3)] hover:shadow-[0_15px_40px_rgba(255,90,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Navigation size={22} className="mt-0.5" />
          바로 주행 시작
        </button>
      </div>

      {/* 상단 검색/로고 오버레이 */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-14 px-6 pb-4 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none">
        <h2 className="text-2xl font-black text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FF9D00]">WINDING</span>
          <span className="text-white">MAP</span>
        </h2>
        <p className="text-xs text-text-secondary font-bold mt-1">주변 와인딩 코스를 탐색하세요</p>
      </div>

      {/* 선택된 코스 프리뷰 카드 (하단 시트) */}
      {selectedRoute && (
        <div className="absolute bottom-28 left-4 right-4 z-40 bento-card p-5 animate-press">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-black text-white">{selectedRoute.name}</h3>
              <p className="text-sm text-primary font-bold">{selectedRoute.region}</p>
            </div>
            <button onClick={() => setSelectedRoute(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-4 text-xs text-text-secondary font-bold mb-4">
            <span>{selectedRoute.distanceKm}km</span>
            <span>{selectedRoute.timeMinutes}분</span>
            <span>헤어핀 {selectedRoute.hairpinCount}개</span>
          </div>
          <button 
            onClick={() => onRouteSelect(selectedRoute.id)}
            className="w-full py-3 rounded-[16px] bg-primary/20 border border-primary/30 text-primary font-bold hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronUp size={16} /> 상세 보기
          </button>
        </div>
      )}
    </div>
  );
}
