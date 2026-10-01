import { expect, test } from '@playwright/test';

// The mock command state lives in the dev server: unique names per run (reuseExistingServer locally).
const uniqueName = () => `e2e-zav-${Date.now()}`;
const SECRET = 'Bearer e2e-service-token';
// AttributeEditor labels both the row group and its input, so the header inputs are found by
// placeholder (name) and by type (the value is the only password input of the form).

test('create a zip-archive-version command, view it without the header value, edit it back and forth', async ({
  page,
}) => {
  const name = uniqueName();
  await page.goto('/dc-operator/commands/create?agent=sandbox-1');
  await page.getByText('zip-archive-version', { exact: true }).click();

  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('dir', { exact: true }).fill('/opt/e2e/bundles');
  await page.getByLabel('versionFile', { exact: true }).fill('/opt/e2e/bundles/current');
  await page.getByLabel('reloadUrl', { exact: true }).fill('http://127.0.0.1:8080/reload?version=${version}');
  await page.getByLabel('reloadBody - optional', { exact: true }).fill('{"version":"${version}"}\nline two');
  await page.getByRole('button', { name: 'Add header' }).click();
  await page.getByPlaceholder('Authorization', { exact: true }).fill('Authorization');
  await page.locator('input[type="password"]').fill(SECRET);
  await page.getByRole('button', { name: 'Create command' }).click();

  // details: header names only, the value nowhere on the page
  await expect(page).toHaveURL(new RegExp(`/commands/sandbox-1/${name}$`));
  await expect(page.getByText(`Command ${name} created`)).toBeVisible();
  await expect(page.getByText('Authorization', { exact: true })).toBeVisible();
  expect(await page.content()).not.toContain('e2e-service-token');
  await expect(page.getByText('--fail-with-body').first()).toBeVisible();

  // edit: everything is loaded back, the header value in a password input
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('input[type="password"]')).toHaveValue(SECRET);
  await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password');
  await expect(page.getByLabel('reloadBody - optional', { exact: true })).toHaveValue(
    '{"version":"${version}"}\nline two',
  );
  await page.getByLabel('waitTimeout - optional', { exact: true }).fill('6m');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText(`Command ${name} updated`)).toBeVisible();
  await expect(page.getByText('6m', { exact: true })).toBeVisible();
  await expect(page.getByText('Authorization', { exact: true })).toBeVisible();

  // a second edit still has the header and the body: nothing was dropped by the first save
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByPlaceholder('Authorization', { exact: true })).toHaveValue('Authorization');
  await expect(page.locator('input[type="password"]')).toHaveValue(SECRET);
  await expect(page.getByLabel('reloadBody - optional', { exact: true })).toHaveValue(
    '{"version":"${version}"}\nline two',
  );
});

test('a config the agent refuses shows its reason in the form', async ({ page }) => {
  await page.goto('/dc-operator/commands/create?agent=sandbox-1');
  await page.getByText('zip-archive-version', { exact: true }).click();

  await page.getByLabel('Name', { exact: true }).fill(uniqueName());
  await page.getByLabel('dir', { exact: true }).fill('/opt/e2e/bundles');
  await page.getByLabel('versionFile', { exact: true }).fill('/opt/e2e/bundles/current');
  await page.getByLabel('reloadUrl', { exact: true }).fill('http://127.0.0.1:8080/reload');
  await page.getByLabel('waitTimeout - optional', { exact: true }).fill('1h');
  await page.getByRole('button', { name: 'Create command' }).click();

  await expect(page.getByText(/field waitTimeout: plus the 1m lock wait/).first()).toBeVisible();
  await expect(page).toHaveURL(/\/commands\/create/);
});

test('the seeded command shows header names on its page, never the token', async ({ page }) => {
  await page.goto('/dc-operator/commands/sandbox-1/mail-templates');
  await expect(page.getByText('Authorization', { exact: true })).toBeVisible();
  expect(await page.content()).not.toContain('mock-service-token');
});
