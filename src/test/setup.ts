import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { storageManager } from '../utils/storageManager';

// jsdom provides a spec-compliant localStorage. Clearing through the manager
// also drops its parsed-value cache -- clearing only the raw store would leave
// the next test reading a stale snapshot.
afterEach(() => {
  cleanup();
  storageManager.clear();
  localStorage.clear();
});
