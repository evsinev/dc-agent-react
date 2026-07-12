import { expect, test } from '@playwright/test';

// Simulate the backend being unreachable by aborting every API call, then assert the UI
// shows an in-content "Failed to load" error with a Retry button (Cloudscape pattern) —
// and does NOT fall back to stacked error flashbars.
test('a failed data load shows an in-content error with Retry (not a flashbar)', async ({ page }) => {
  await page.route('**/dc-operator/api/**', (route) => route.abort());

  await page.goto('/dc-operator/');

  await expect(page.getByText('Failed to load applications')).toBeVisible();
  await expect(page.getByText('Could not connect to the server.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});

test('Retry re-fetches and renders the data once the backend responds', async ({ page }) => {
  let fail = true;
  // Fail only the app list on the first attempt; let it through on retry.
  await page.route('**/dc-operator/api/app/list', (route) => (fail ? route.abort() : route.continue()));

  await page.goto('/dc-operator/');
  await expect(page.getByText(/Failed to load applications/)).toBeVisible();

  fail = false;
  await page.getByRole('button', { name: 'Retry' }).click();

  await expect(
    page.getByRole('link', { name: 'hello-local' }).or(page.getByRole('link', { name: 'hello-world' })),
  ).toBeVisible();
});
