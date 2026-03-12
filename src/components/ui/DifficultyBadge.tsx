import React from 'react';
import { cn } from '../../lib/utils';
import { Difficulty } from '../../types/route';

interface DifficultyBadgeProps {
  level: Difficulty;
  className?: string;
}

export function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
  const getStyle = () => {
    switch (level) {
      case '상': return 'bg-error/20 text-error border-error/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case '중': return 'bg-warning/20 text-warning border-warning/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case '하': return 'bg-success/20 text-success border-success/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black border tracking-wider",
      getStyle(),
      className
    )}>
      난이도 {level}
    </span>
  );
}
