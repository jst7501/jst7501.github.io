import React from 'react';
import { RouteSurrounding } from '../../types/route';
import { Coffee, Fuel, Map, ParkingCircle } from 'lucide-react';

interface SurroundingInfoBoxProps {
  points: RouteSurrounding[];
}

export function SurroundingInfoBox({ points }: SurroundingInfoBoxProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case '식당/카페': return <Coffee size={18} />;
      case '주유소': return <Fuel size={18} />;
      case '주차/휴식': return <ParkingCircle size={18} />;
      case '관광지': return <Map size={18} />;
      default: return <Map size={18} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case '식당/카페': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case '주유소': return 'text-error bg-error/10 border-error/30';
      case '주차/휴식': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case '관광지': return 'text-success bg-success/10 border-success/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  if (!points || points.length === 0) return null;

  return (
    <div className="bento-card p-6">
      <h3 className="text-xl font-black text-white mb-5 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-accent-purple rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
        주변 거점
      </h3>

      <div className="flex flex-col gap-3">
        {points.map((point, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-[20px] bg-bg-base/50 border border-white/5 hover:bg-white/5 transition-colors group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 ${getColor(point.type)}`}>
              {getIcon(point.type)}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-white font-bold text-sm truncate">{point.name}</h4>
              <p className="text-xs text-text-secondary truncate mt-0.5">{point.description}</p>
            </div>
            <div className="flex flex-col items-end justify-center shrink-0">
              <span className="text-[10px] font-bold text-text-tertiary">{point.distanceKm}km</span>
              <span className="text-[10px] text-primary font-bold">{point.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
