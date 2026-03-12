import React from 'react';
import { NaverMap, NaverMarkerData } from '../../components/map/NaverMap';
import { RouteNode } from '../../types/route';

interface CourseMapProps {
  nodes: RouteNode[];
}

export function CourseMap({ nodes }: CourseMapProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="bento-card p-6 relative overflow-hidden group">
        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
          <span className="w-1.5 h-6 bg-accent-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
          코스 지도
        </h3>
        <div className="w-full aspect-[4/3] bg-bg-base/60 rounded-[20px] border border-dashed border-border-strong flex items-center justify-center">
          <p className="text-text-secondary text-sm font-bold">코스 좌표가 없습니다</p>
        </div>
      </div>
    );
  }

  // 중심 좌표 계산 (전체 노드의 평균)
  const center = {
    lat: nodes.reduce((s, n) => s + n.lat, 0) / nodes.length,
    lng: nodes.reduce((s, n) => s + n.lng, 0) / nodes.length,
  };

  // Polyline 경로
  const polylinePath = nodes.map(n => ({ lat: n.lat, lng: n.lng }));

  // 마커 생성
  const markers: NaverMarkerData[] = nodes.map(n => ({
    lat: n.lat,
    lng: n.lng,
    label: n.label,
    type: n.type,
  }));

  return (
    <div className="bento-card p-0 relative overflow-hidden group">
      {/* 헤더 오버레이 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-5 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <span className="w-1.5 h-5 bg-accent-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
          코스 지도
        </h3>
      </div>

      {/* 하단 범례 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-4 text-[10px] font-bold text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_6px_rgba(255,90,0,0.6)]" /> 출발
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-white/30 bg-white/10" /> 경유지
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-success shadow-[0_0_6px_rgba(16,185,129,0.6)]" /> 도착
          </span>
        </div>
      </div>

      <NaverMap
        center={center}
        polylinePath={polylinePath}
        markers={markers}
        height="320px"
        fitToPath
      />
    </div>
  );
}
