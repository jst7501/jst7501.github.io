import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
      <div className="w-24 h-24 bg-bg-surface-elevated rounded-full flex items-center justify-center text-5xl mb-6 border border-border-subtle shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] relative">
        <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
        <span className="relative z-10 opacity-70 grayscale">{icon}</span>
      </div>
      <h3 className="text-xl font-black text-white mb-2">{title}</h3>
      <p className="text-text-secondary text-sm font-medium">{description}</p>
    </div>
  );
}
