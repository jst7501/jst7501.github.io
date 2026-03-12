import React from 'react';
import { cn } from '../../lib/utils';
import { RoadConditionType } from '../../types/route';
import { AlertTriangle, CloudRain, Snowflake, Waves, Wind } from 'lucide-react';

interface RoadConditionBadgeProps {
  condition: RoadConditionType;
  className?: string;
}

export function RoadConditionBadge({ condition, className }: RoadConditionBadgeProps) {
  const getConfig = () => {
    switch (condition) {
      case '포트홀': return { icon: AlertTriangle, style: 'bg-error/10 text-error border-error/30' };
      case '블랙아이스': return { icon: Snowflake, style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case '낙엽': return { icon: Wind, style: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
      case '공사': return { icon: AlertTriangle, style: 'bg-warning/10 text-warning border-warning/30' };
      case '젖은노면': return { icon: CloudRain, style: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case '모래/자갈': return { icon: Waves, style: 'bg-yellow-600/10 text-yellow-500 border-yellow-600/30' };
      default: return { icon: AlertTriangle, style: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
    }
  };

  const { icon: Icon, style } = getConfig();

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border",
      style,
      className
    )}>
      <Icon size={10} />
      {condition}
    </span>
  );
}
