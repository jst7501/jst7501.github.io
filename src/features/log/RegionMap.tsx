import React from 'react';
import { useLogStore } from '../../store/logStore';
import { NaverMap, NaverMarkerData } from '../../components/map/NaverMap';

/**
 * 대한민국 정복 지도 — 방문한 지역을 실제 네이버 지도 위에 마커로 표시
 */

// 각 도 대표 좌표
const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  '경기': { lat: 37.4138, lng: 127.5183 },
  '강원': { lat: 37.8228, lng: 128.1555 },
  '충북': { lat: 36.6357, lng: 127.4912 },
  '충남': { lat: 36.6588, lng: 126.6728 },
  '경북': { lat: 36.4919, lng: 128.8889 },
  '전북': { lat: 35.7175, lng: 127.153 },
  '경남': { lat: 35.4606, lng: 128.2132 },
  '전남': { lat: 34.8679, lng: 126.991 },
  '제주': { lat: 33.4996, lng: 126.5312 },
};

export function RegionMap() {
  const { visitedRegions } = useLogStore();

  const markers: NaverMarkerData[] = Object.entries(REGION_COORDS).map(([region, coords]) => ({
    lat: coords.lat,
    lng: coords.lng,
    label: region,
    type: visitedRegions.includes(region) ? 'start' : 'waypoint',
  }));

  const visitedCount = visitedRegions.length;

  return (
    <div className="bento-card p-6 overflow-hidden">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-accent-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
            대한민국 정복 지도
          </h3>
          <p className="text-xs text-text-secondary font-medium pl-3.5">
            {visitedCount}/9개 도 방문 완료
          </p>
        </div>
      </div>

      <div className="rounded-[20px] overflow-hidden border border-white/10">
        <NaverMap
          center={{ lat: 36.0, lng: 127.5 }}
          zoom={7}
          markers={markers}
          height="280px"
          fitToPath={false}
        />
      </div>
    </div>
  );
}
