import { expect, test } from '@playwright/test';

test('app list renders mock apps with their statuses', async ({ page }) => {
  await page.goto('/dc-operator/');

  await expect(page.getByRole('heading', { name: 'App list' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'hello-world' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'demo-clock' })).toBeVisible();

  // demo-clock is seeded as DRIFT in the mock data.
  await expect(page.getByText('Configuration drift detected')).toBeVisible();
});

test('quick "Pull from Git" shows the git status hint and a success flashbar', async ({ page }) => {
  await page.goto('/dc-operator/');

  // The table header shows the branch/updated hint from /git/log.
  await expect(page.getByText(/sandbox-main · updated/)).toBeVisible();

  await page.getByRole('button', { name: 'Pull from Git' }).click();

  // The mock grows the log by one commit per pull, so the first pull is a success.
  await expect(page.getByText(/Pulled 1 new commit from sandbox-main/)).toBeVisible();
});
