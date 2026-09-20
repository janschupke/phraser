/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ToastItem, type Toast } from '../components/ui/Toast';
import { createId } from '../utils/id';

interface ToastContextType {
  showToast: (type: 'success' | 'error', message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = createId();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
      timersRef.current.delete(id);
    }, 5000);

    timersRef.current.set(id, timer);
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      // Cleanup all timers on unmount
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed inset-x-4 bottom-4 z-60 flex flex-col items-stretch gap-3 sm:inset-x-auto sm:right-4 sm:bottom-auto sm:top-20 sm:items-end"
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="animate-slide-in-right sm:min-w-[300px] sm:max-w-md">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
