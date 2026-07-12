import { expect, test } from '@playwright/test';

test('sidebar navigates between sections', async ({ page }) => {
  await page.goto('/dc-operator/');

  await page.getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/\/dc-operator\/services/);
  await expect(page.getByRole('heading', { name: 'Services', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'echo-svc' })).toBeVisible();

  await page.getByRole('link', { name: 'Git repo' }).click();
  await expect(page).toHaveURL(/\/dc-operator\/git/);
  await expect(page.getByText('sandbox-main')).toBeVisible();
});
