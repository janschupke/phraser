import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';

/**
 * Real-Chromium suite: what jsdom cannot measure (see src/test/axe.ts).
 *
 * Tailwind is in the plugin list on purpose -- without it the tests would
 * measure unstyled markup, and contrast would pass on browser defaults.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Without dedupe the test file and the pre-bundled components can each get
  // their own React, and the first hook call dies on a null dispatcher.
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    include: ['src/**/*.browser.test.tsx'],
    // One browser, one file at a time.
    fileParallelism: false,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
