import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow DOM to render before animating transform
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = 'auto';
      }, 300); // Matches transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Sheet Engine */}
      <div 
        className={`relative w-full max-w-[480px] hyper-glass rounded-t-3xl pt-2 pb-8 px-6 transition-transform duration-300 ease-out shadow-[0_-20px_40px_rgba(0,0,0,0.5)] ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-border-strong rounded-full mx-auto mb-6 bg-white/20" />
        
        {/* Header */}
        {(title) && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-bg-surface-elevated hover:bg-white/10 text-text-secondary hover:text-white transition-all border border-border-subtle"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
