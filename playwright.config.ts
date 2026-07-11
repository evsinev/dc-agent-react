import { defineConfig, devices } from '@playwright/test';

// E2E runs against the offline mock dev server (`yarn dev:mock`), so it's
// deterministic and needs no backend. The app is served under /dc-operator.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'yarn dev:mock',
    url: 'http://localhost:3000/dc-operator/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
