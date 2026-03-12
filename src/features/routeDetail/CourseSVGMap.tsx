import React from 'react';
import { RouteNode } from '../../types/route';

interface CourseSVGMapProps {
  nodes: RouteNode[];
}

export function CourseSVGMap({ nodes }: CourseSVGMapProps) {
  if (nodes.length < 2) return null;

  // Map Coordinates onto 0-100% SVG Box
  const xCoords = nodes.map(n => n.lng);
  const yCoords = nodes.map(n => n.lat);
  
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const points = nodes.map(n => ({
    x: ((n.lng - minX) / rangeX) * 100,
    // Invert Y because SVG coordinates go down, GPS goes up
    y: (1 - ((n.lat - minY) / rangeY)) * 100,
    type: n.type
  }));

  const pathD = `M ${points[0].x} ${points[0].y} ` + 
    points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  const waypoints = points.filter(p => p.type === 'waypoint');
  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  return (
    <div className="bento-card p-6 overflow-hidden relative group">
      {/* Radar Sweep Animation (Visual Flare) */}
      <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_70%,rgba(255,90,0,0.1)_100%)] animate-[spin_4s_linear_infinite] rounded-full pointer-events-none" />
      
      <h3 className="text-xl font-black text-white mb-6 relative z-10 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(255,90,0,0.8)]" />
        코스 레이아웃
      </h3>
      
      <div className="w-full aspect-square bg-[#050505]/80 rounded-[24px] border border-white/5 relative z-10 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-8 backdrop-blur-sm">
        <svg viewBox="-5 -5 110 110" className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(255,90,0,0.5)]">
          {/* Base Track */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="var(--color-primary)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="opacity-20"
          />
          {/* Animated Neon Track Overlap */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#neonGradient)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeDasharray="1000"
            strokeDashoffset="1000"
            className="animate-[dash_3s_ease-out_forwards]"
          />
          
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFCC00" />
              <stop offset="50%" stopColor="#FF5A00" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Points */}
          {/* Start Point */}
          <circle cx={startPoint.x} cy={startPoint.y} r="3" fill="#10B981" className="shadow-[0_0_10px_#10B981]" />
          <text x={startPoint.x} y={startPoint.y - 6} fontSize="4" fill="#10B981" textAnchor="middle" fontWeight="bold">START</text>
          
          {/* Waypoints (Apexes) */}
          {waypoints.map((wp, i) => (
            <circle key={i} cx={wp.x} cy={wp.y} r="2" fill="#FF5A00" opacity="0.8" className="animate-pulse" />
          ))}

          {/* End Point */}
          <circle cx={endPoint.x} cy={endPoint.y} r="3" fill="#EF4444" />
          <text x={endPoint.x} y={endPoint.y - 6} fontSize="4" fill="#EF4444" textAnchor="middle" fontWeight="bold">END</text>
        </svg>

        <style>{`
          @keyframes dash {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 relative z-10 text-[10px] font-bold text-text-secondary">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success shadow-[0_0_5px_#10B981]"></span> 출발 </div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#FF5A00]"></span> 코너(Apex)</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error shadow-[0_0_5px_#EF4444]"></span> 도착 </div>
      </div>
    </div>
  );
}
