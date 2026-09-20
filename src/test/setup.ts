import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom provides a spec-compliant localStorage; clearing it after each test
// keeps state from leaking between tests and between test files.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
