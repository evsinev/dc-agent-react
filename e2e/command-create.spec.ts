import { expect, test } from '@playwright/test';

// The mock command state is in-memory in the dev server, so use a unique name per run to
// avoid a 409 when the server is reused across runs (reuseExistingServer locally).
const uniqueName = () => `e2e-jar-${Date.now()}`;

test('Add command on the Commands list opens the create screen', async ({ page }) => {
  await page.goto('/dc-operator/commands');
  await page.getByRole('button', { name: 'Add command' }).click();

  await expect(page).toHaveURL(/\/commands\/create/);
  await expect(page.getByRole('heading', { name: 'Create command' })).toBeVisible();
});

test('create a JAR command and land on its details page', async ({ page }) => {
  const name = uniqueName();
  // ?agent preselects the agent, so no Select interaction is needed.
  await page.goto('/dc-operator/commands/create?agent=sandbox-1');
  await expect(page.getByRole('heading', { name: 'Create command' })).toBeVisible();

  // serviceName auto-fills from Name; only Name + jarFilename need values (JAR is the default tile).
  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('jarFilename', { exact: true }).fill('/srv/e2e/app.jar');

  await page.getByRole('button', { name: 'Create command' }).click();

  await expect(page).toHaveURL(new RegExp(`/commands/sandbox-1/${name}$`));
  await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByText(`Command ${name} created`)).toBeVisible();
});

test('validation blocks submit and shows a field error', async ({ page }) => {
  await page.goto('/dc-operator/commands/create?agent=sandbox-1');
  await expect(page.getByRole('heading', { name: 'Create command' })).toBeVisible();

  // Submit with an empty Name (and empty required jarFilename).
  await page.getByRole('button', { name: 'Create command' }).click();

  await expect(page.getByText('Name is required.', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/commands\/create/);
});
