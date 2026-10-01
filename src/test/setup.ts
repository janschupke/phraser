import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { storageManager } from '../utils/storageManager';

// jsdom has no ResizeObserver, and Radix's tooltip positioning creates one the
// moment a tooltip opens -- which a click does, since it focuses the trigger.
// There is no layout to observe here; the browser suite covers real geometry.
class ResizeObserverStub {
  observe() {
    /* no layout in jsdom */
  }
  unobserve() {
    /* no layout in jsdom */
  }
  disconnect() {
    /* no layout in jsdom */
  }
}
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverStub;
}

afterEach(() => {
  cleanup();
  storageManager.clear();
  localStorage.clear();
});
