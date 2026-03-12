import React from 'react';
import { SignatureCorner } from '../../lib/personaEngine';
import { Crosshair, TrendingDown, Gauge, Navigation } from 'lucide-react';

interface SignatureCornerCardProps {
  corner: SignatureCorner;
  routeName: string;
}

/**
 * 시그니처 코너 현미경 분석 카드
 * 코스에서 가장 격렬한 헤어핀 구간을 집중 분석
 */
export function SignatureCornerCard({ corner, routeName }: SignatureCornerCardProps) {
  const minSpeedKmh = Math.round(corner.minSpeed * 3.6);
  const peakG = corner.peakLateralG.toFixed(2);

  return (
    <div className="bento-card p-6 relative overflow-hidden group">
      {/* 배경 글로우 */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-warning/20 rounded-full blur-[40px] group-hover:bg-warning/30 transition-colors" />

      <h3 className="text-xl font-black text-white flex items-center gap-2 mb-1 relative z-10">
        <span className="w-1.5 h-6 bg-warning rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
        시그니처 코너 분석 🔬
      </h3>
      <p className="text-xs text-text-secondary font-bold mb-5 pl-3.5 relative z-10">
        {routeName}의 가장 격렬한 코너
      </p>

      {/* 미니 G 그래프 (횡G 시계열) */}
      <div className="relative z-10 bg-[#050505] rounded-[20px] border border-white/5 p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Crosshair size={14} className="text-warning" />
          <span className="text-xs font-bold text-text-secondary">코너 횡 G 프로파일</span>
        </div>
        <div className="flex items-end gap-[2px] h-16">
          {corner.points.map((p, i) => {
            const g = Math.abs(p.lateralG);
            const maxG = Math.max(corner.peakLateralG, 0.1);
            const height = Math.max(4, (g / maxG) * 100);
            const isApex = i === corner.apexIndex - corner.entryIndex;
            const color = g > 0.8 ? 'bg-error' : g > 0.4 ? 'bg-warning' : 'bg-success';

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm ${color} transition-all ${isApex ? 'ring-2 ring-white/30' : ''}`}
                  style={{ height: `${height}%` }}
                />
                {isApex && <span className="text-[8px] text-warning font-black">APEX</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3열 스탯 */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        <CornerStat 
          icon={<Gauge size={16} />} 
          label="피크 횡 G" 
          value={`${peakG}G`} 
          color="text-error" 
        />
        <CornerStat 
          icon={<TrendingDown size={16} />} 
          label="최저 속도" 
          value={`${minSpeedKmh}km/h`} 
          color="text-accent-teal" 
        />
        <CornerStat 
          icon={<Navigation size={16} />} 
          label="브레이크 거리" 
          value={`${corner.brakeDistance}s`} 
          color="text-warning" 
        />
      </div>
    </div>
  );
}

function CornerStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-bg-base/60 rounded-[16px] p-3 text-center border border-white/5">
      <div className={`flex items-center justify-center gap-1 mb-1 ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] text-text-tertiary font-bold mb-0.5">{label}</p>
      <p className="text-base font-black text-white">{value}</p>
    </div>
  );
}
