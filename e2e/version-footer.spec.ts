import { expect, test } from '@playwright/test';

// The left-nav footer shows the frontend version (build-injected package.json version in dev/mock)
// and the backend version (from /api/info — 'mock' under the offline mock middleware).
test('the left navigation shows a frontend and backend version footer', async ({ page }) => {
  await page.goto('/dc-operator/');

  await expect(page.getByText('frontend', { exact: true })).toBeVisible();
  await expect(page.getByText('backend', { exact: true })).toBeVisible();
  await expect(page.getByText('mock', { exact: true })).toBeVisible();
});
