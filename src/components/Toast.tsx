import React from 'react';
import { ToastMessage, ThemeConfig } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  theme: ThemeConfig;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss, theme }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const icon = toast.type === 'error' ? (
          <AlertCircle size={18} className="text-red-400 shrink-0" />
        ) : toast.type === 'warning' ? (
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
        );

        return (
          <div
            key={toast.id}
            data-testid={`toast-${toast.id}`}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in"
            style={{
              backgroundColor: theme.cardBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${theme.cardBorder}`,
              color: theme.textPrimary
            }}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-semibold tracking-wide uppercase opacity-90">{toast.title}</h5>
              <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity"
              data-testid={`toast-close-${toast.id}`}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
