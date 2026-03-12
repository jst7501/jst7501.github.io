import React, { useEffect } from 'react';
import { create } from 'zustand';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: Toast[];
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, title, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000); // 4 seconds visible
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    // Mount animation class apply
    const el = document.getElementById(`toast-${toast.id}`);
    if (el) {
      setTimeout(() => el.classList.remove('translate-y-full', 'opacity-0', 'scale-90'), 50);
    }
  }, [toast.id]);

  const config = {
    success: { icon: CheckCircle2, color: 'text-success', border: 'border-success/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' },
    error: { icon: AlertCircle, color: 'text-error', border: 'border-error/30', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' },
    info: { icon: Info, color: 'text-primary', border: 'border-primary/30', glow: 'shadow-[0_0_20px_rgba(255,90,0,0.2)]' }
  }[toast.type];

  const Icon = config.icon;

  return (
    <div 
      id={`toast-${toast.id}`}
      className={`translate-y-full opacity-0 scale-90 transition-all duration-400 ease-out hyper-glass px-4 py-3 rounded-2xl border ${config.border} flex items-start gap-3 w-[calc(100vw-32px)] max-w-sm pointer-events-auto ${config.glow}`}
    >
      <Icon className={`mt-0.5 shrink-0 ${config.color}`} size={20} />
      <div className="flex-1">
        <h4 className="font-bold text-white text-sm">{toast.title}</h4>
        {toast.message && <p className="text-text-secondary text-xs mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={onRemove} className="text-text-tertiary hover:text-white mt-0.5">
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-safe z-[200] w-full max-w-[480px] left-1/2 -translate-x-1/2 p-4 flex flex-col gap-3 pointer-events-none items-center mt-12">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
