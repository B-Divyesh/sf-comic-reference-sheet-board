import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates, connects, saves, and reloads a four-panel board', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Continuity Board' })).toBeVisible();
  await page.getByRole('button', { name: 'Start a four-panel board' }).click();
  await page.getByLabel('Project name').fill('The Brass Key');
  await page.getByLabel('One-line story intent').fill('A courier realizes the key is a decoy.');
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'The Brass Key' })).toBeVisible();

  await page.getByRole('button', { name: 'Add first reference' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Mara Vale');
  await page.getByLabel('Role or kind').fill('Courier');
  await page.getByLabel('Source / attribution').fill('Original sketch by the table group');
  await page.getByLabel('Locked attributes').fill('Teal coat\nBrass key on red cord');
  await page.getByRole('button', { name: 'Save reference' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Mara Vale' })).toBeVisible();

  await page.getByRole('button', { name: 'Edit shot' }).first().click();
  await page.getByLabel('Shot / framing').fill('Close-up');
  await page.getByLabel('Action or panel intent').fill('Mara turns the key over in her hand.');
  await page.getByLabel('Mara Vale').check();
  await page.getByRole('button', { name: 'Save shot' }).click();
  await expect(page.getByText('1 of 4 shots linked')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /Saved locally|Saving/ }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 2, name: 'The Brass Key' })).toBeVisible();
  await expect(page.getByText('Original sketch by the table group')).toBeVisible();
  expect(errors).toEqual([]);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['critical', 'serious'].includes(item.impact || ''))).toEqual([]);
});

test('remains usable offline after first load', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Continuity Board' })).toBeVisible();
  await expect(page.getByText('Offline · local changes work')).toBeAttached();
});
