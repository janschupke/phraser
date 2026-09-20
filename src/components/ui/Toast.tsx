export interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

/**
 * Presentational only. The dismiss timer lives in ToastProvider, which owns the
 * toast list -- an earlier version of this component ran its own setTimeout,
 * giving two independent sources of truth for when a toast disappears.
 */
export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const isError = toast.type === 'error';

  return (
    <div
      className={`p-4 rounded-lg shadow-lg ${
        isError
          ? 'bg-error-100 text-error-800 border border-error-200'
          : 'bg-success-100 text-success-800 border border-success-200'
      }`}
      // Errors interrupt; routine confirmations wait their turn. The container
      // carries the polite live region for the success case.
      role={isError ? 'alert' : undefined}
    >
      <div className="flex justify-between items-center">
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="ml-4 text-current opacity-70 hover:opacity-100 text-xl leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
