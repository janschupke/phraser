import { useEffect } from 'react';
import { Alert } from './Alert';

export interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  duration?: number;
}

export function ToastItem({ toast, onDismiss, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss, duration]);

  return (
    <div className="animate-slide-in-right mb-3 min-w-[300px] max-w-md">
      <Alert type={toast.type} onDismiss={() => onDismiss(toast.id)}>
        {toast.message}
      </Alert>
    </div>
  );
}
