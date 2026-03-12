import React from 'react';
import { cn } from '../../lib/utils';

interface TagProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export function Tag({ children, className, active, onClick }: TagProps) {
  return (
    <span 
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 select-none animate-press tracking-wide",
        onClick && "cursor-pointer",
        active 
          ? "bg-primary text-white shadow-[0_0_15px_rgba(255,90,0,0.4)] border border-primary/50" 
          : "bg-bg-surface-elevated text-text-secondary hover:text-white border border-border-subtle hover:border-border-strong hover:bg-white/5",
        className
      )}
    >
      {children}
    </span>
  );
}
