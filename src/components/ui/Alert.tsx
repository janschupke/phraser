import { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error';
  children: ReactNode;
  onDismiss?: () => void;
}

export function Alert({ type, children, onDismiss }: AlertProps) {
  const typeClasses = {
    success: 'bg-success-100 text-success-800',
    error: 'bg-error-100 text-error-800',
  };

  return (
    <div className={`p-4 rounded-lg ${typeClasses[type]}`} role="alert">
      <div className="flex justify-between items-center">
        <span>{children}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-current opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
