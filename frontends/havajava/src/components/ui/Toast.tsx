/* eslint-disable react-refresh/only-export-components */
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { create } from 'zustand';

// ============================================================================
// Toast Store
// ============================================================================

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { ...toast, id }],
    }));
  },
  remove: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Convenience functions
export const toast = {
  success: (message: string, duration = 2500) =>
    useToastStore.getState().add({ message, type: 'success', duration }),
  error: (message: string, duration = 4000) =>
    useToastStore.getState().add({ message, type: 'error', duration }),
  info: (message: string, duration = 3000) =>
    useToastStore.getState().add({ message, type: 'info', duration }),
};

// ============================================================================
// Toast Container
// ============================================================================

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="fixed top-4 left-4 right-4 z-100 flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Toast Item
// ============================================================================

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const iconColors = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-brand',
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);

  const dismiss = useCallback(() => remove(t.id), [remove, t.id]);

  useEffect(() => {
    const timer = setTimeout(dismiss, t.duration || 3000);
    return () => clearTimeout(timer);
  }, [dismiss, t.duration]);

  const Icon = icons[t.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto w-full max-w-sm bg-surface-card border border-border-default rounded-lg shadow-lg shadow-black/5 flex items-center gap-3 px-4 py-3"
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 ${iconColors[t.type]}`} />
      <p className="flex-1 text-sm font-medium text-text-primary">{t.message}</p>
      <button
        onClick={dismiss}
        className="p-1 -m-1 rounded-full hover:bg-surface-elevated transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-text-muted" />
      </button>
    </motion.div>
  );
}
