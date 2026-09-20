import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useHotkeys } from '../../hooks/useHotkeys';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A modal dialog with the semantics a dialog actually needs: a labelled
 * role="dialog", a focus trap, focus restored to whatever opened it, Escape to
 * close, and the page behind it hidden from assistive tech.
 *
 * Rendered through a portal, which is load-bearing rather than tidy: the
 * flashcard Card carries transform-gpu, and a transformed ancestor makes
 * position:fixed resolve against that ancestor instead of the viewport, so an
 * in-tree modal is clipped by the card.
 *
 * Hand-rolled instead of <dialog> because jsdom has no showModal, which would
 * put a polyfill in front of every modal test.
 */
export function Modal({ isOpen, title, children, footer, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useHotkeys({ Escape: onClose }, { enabled: isOpen, allowInEditable: true });

  // Move focus in on open and put it back where it came from on close.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();

    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  // Keep Tab inside the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // Stop the page behind from scrolling while the dialog is up.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        className="bg-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in"
      >
        <h2 id={titleId} className="text-xl font-bold text-neutral-800 mb-4">
          {title}
        </h2>
        <div id={bodyId} className="text-neutral-700 mb-6">
          {children}
        </div>
        {footer && <div className="flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
