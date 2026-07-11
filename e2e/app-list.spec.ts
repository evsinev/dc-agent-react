import { expect, test } from '@playwright/test';

test('app list renders mock apps with their statuses', async ({ page }) => {
  await page.goto('/dc-operator/');

  await expect(page.getByRole('heading', { name: 'App list' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'hello-world' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'demo-clock' })).toBeVisible();

  // demo-clock is seeded as DRIFT in the mock data.
  await expect(page.getByText('Configuration drift detected')).toBeVisible();
});
