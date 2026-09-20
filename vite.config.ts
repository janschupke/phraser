import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      clean: true,
      // include (rather than the default) so untested files count as 0% instead
      // of being invisible to the report.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx', // 8-line bootstrap with no branches; only "testable" by
        // mocking react-dom/client, which asserts nothing about behaviour.
        'src/types.ts', // type-only, compiles to an empty module
        'src/test/**', // test infrastructure, not product code
        'src/**/*.test.{ts,tsx}',
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
