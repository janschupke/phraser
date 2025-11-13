/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { Toast } from '../components/ui/Toast';

interface ToastContextType {
  showToast: (type: 'success' | 'error', message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
      <div className="fixed top-20 right-4 z-50 flex flex-col items-end gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-slide-in-right min-w-[300px] max-w-md">
            <div
              className={`p-4 rounded-lg shadow-lg ${
                toast.type === 'success'
                  ? 'bg-success-100 text-success-800 border border-success-200'
                  : 'bg-error-100 text-error-800 border border-error-200'
              }`}
              role="alert"
            >
              <div className="flex justify-between items-center">
                <span>{toast.message}</span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="ml-4 text-current opacity-70 hover:opacity-100 text-xl leading-none"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
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
