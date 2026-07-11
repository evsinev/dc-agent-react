import { defineConfig } from '@rstest/core';

// Rstest bundles Rsbuild v2, while the app build stays on Rsbuild v1 — so we
// don't reuse the v1 `@rsbuild/plugin-react` here (incompatible). JSX is enabled
// directly through SWC's automatic React runtime instead.
export default defineConfig({
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  include: ['src/**/*.test.{ts,tsx}', 'mock/**/*.test.ts'],
  resolve: {
    alias: {
      '@': './src',
      // Point at the file that actually exists (rsbuild.config.ts aliases a stale config.ts).
      '@routing': './src/app/router/routing.ts',
    },
  },
  tools: {
    swc: {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    },
  },
});
