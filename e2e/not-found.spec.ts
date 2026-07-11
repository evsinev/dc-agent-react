import { expect, test } from '@playwright/test';

test('unknown route shows the not-found page', async ({ page }) => {
  await page.goto('/dc-operator/does-not-exist');

  await expect(page.getByRole('heading', { name: 'Not found' })).toBeVisible();
  await expect(page.getByText('Page not found')).toBeVisible();
});
