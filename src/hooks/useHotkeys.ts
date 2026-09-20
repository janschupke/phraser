import { useEffect, useRef } from 'react';

export type HotkeyHandler = (event: KeyboardEvent) => void;

export interface HotkeyOptions {
  /** Skip this registration entirely while false. */
  enabled?: boolean;
  /**
   * Handle the key even when focus is inside a text field. Only Escape wants
   * this; anything else would swallow the user's typing.
   */
  allowInEditable?: boolean;
  /** Handle auto-repeat from a held key. Off by default. */
  allowRepeat?: boolean;
}

interface Registration {
  /** Read through a ref so re-renders do not churn the registration order. */
  keys: { current: Record<string, HotkeyHandler> };
  options: Required<HotkeyOptions>;
}

/**
 * Keys named the way callers think about them, mapped to KeyboardEvent.key.
 * 'Space' is the friendly spelling of ' '.
 */
const normalizeKey = (key: string): string => {
  if (key === ' ' || key === 'Spacebar') return 'Space';
  return key;
};

/** Elements that take text input, where hotkeys must not steal the keystroke. */
const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

/**
 * True when the browser will itself activate this element for this key, so a
 * hotkey must stand down or the action fires twice.
 *
 * Enter activates buttons and links on keydown; Space activates buttons and
 * checkboxes on keyup (and the browser already suppresses the page scroll).
 */
const isNativelyActivated = (target: EventTarget | null, key: string): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (key === 'Enter') return Boolean(target.closest('button, a[href], summary'));
  if (key === 'Space') {
    return Boolean(target.closest('button, summary, input[type="checkbox"], input[type="radio"]'));
  }
  return false;
};

// One listener for the whole app. Registrations are dispatched in reverse mount
// order, so the most recently mounted consumer -- the modal on top, say -- gets
// first refusal on a key, and nothing underneath also reacts to it.
const registrations: Registration[] = [];
let listening = false;

const handleKeyDown = (event: KeyboardEvent): void => {
  // An IME is mid-composition. Critical for a Mandarin app: pinyin input uses
  // Space to commit the highlighted candidate.
  // keyCode 229 is the long-standing cross-browser signal for "IME is handling
  // this"; isComposing alone is not reliable on keydown everywhere.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  if (event.isComposing || event.keyCode === 229) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const key = normalizeKey(event.key);

  for (let i = registrations.length - 1; i >= 0; i -= 1) {
    const registration = registrations[i];
    if (!registration) continue;

    const { keys, options } = registration;
    const handler = keys.current[key];
    if (!handler || !options.enabled) continue;
    if (event.repeat && !options.allowRepeat) return;
    if (!options.allowInEditable && isEditableTarget(event.target)) return;
    // Let the browser's own activation be the single source of the action.
    if (isNativelyActivated(event.target, key)) return;

    event.preventDefault();
    handler(event);
    return;
  }
};

const ensureListening = (): void => {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener('keydown', handleKeyDown);
};

/**
 * Binds keyboard shortcuts through a single shared listener.
 *
 * Replaces the pattern of each component adding its own window keydown handler
 * with its own ad-hoc "am I in an input?" check, which meant several handlers
 * could respond to the same key.
 */
export function useHotkeys(keys: Record<string, HotkeyHandler>, options: HotkeyOptions = {}): void {
  const { enabled = true, allowInEditable = false, allowRepeat = false } = options;

  // Keep the live handlers in a ref so the registration identity is stable and
  // the mount order stays meaningful across re-renders. Synced in an effect
  // rather than during render, which would be a ref write mid-render.
  const keysRef = useRef(keys);
  useEffect(() => {
    keysRef.current = keys;
  });

  useEffect(() => {
    const registration: Registration = {
      keys: keysRef,
      options: { enabled, allowInEditable, allowRepeat },
    };

    registrations.push(registration);
    ensureListening();

    return () => {
      const index = registrations.indexOf(registration);
      if (index !== -1) registrations.splice(index, 1);
    };
  }, [enabled, allowInEditable, allowRepeat]);
}
