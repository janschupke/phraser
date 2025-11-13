import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">{title}</h2>
        <p className="text-neutral-700 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="neutral" onClick={onCancel}>
            {cancelText}
          </Button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              variant === 'danger'
                ? 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500'
                : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
