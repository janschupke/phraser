import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { storageManager } from '../utils/storageManager';

afterEach(() => {
  cleanup();
  storageManager.clear();
  localStorage.clear();
});
