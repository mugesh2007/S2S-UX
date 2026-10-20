import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const value = {
    toast: addToast,
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  };

  const icons = {
    success: (
      <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
        <CheckCircle2 className="w-4 h-4" />
      </div>
    ),
    error: (
      <div className="p-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
        <AlertCircle className="w-4 h-4" />
      </div>
    ),
    warning: (
      <div className="p-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </div>
    ),
    info: (
      <div className="p-1 rounded-lg bg-electric-500/15 text-electric-400 border border-electric-500/30 shrink-0">
        <Info className="w-4 h-4" />
      </div>
    ),
  };

  const toastStyles = {
    success: 'border-emerald-500/40 bg-charcoal-900/95 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.2)]',
    error: 'border-red-500/50 bg-charcoal-900/95 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.25)] ring-1 ring-red-500/20',
    warning: 'border-amber-500/50 bg-charcoal-900/95 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/20',
    info: 'border-electric-500/40 bg-charcoal-900/95 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.2)]',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl',
                'backdrop-blur-xl border text-slate-100 transition-all',
                toastStyles[item.type]
              )}
            >
              <div className="mt-0.5">{icons[item.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                {item.message && (
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
