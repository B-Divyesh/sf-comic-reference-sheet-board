import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function waitForOfflineControl(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Service worker did not take control')), 5_000);
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.clearTimeout(timeout);
          resolve();
        }, { once: true });
      });
    }
    const cacheNames = await caches.keys();
    const entries = (await Promise.all(cacheNames.map(async (name) => {
      const cache = await caches.open(name);
      return Promise.all((await cache.keys()).map(async (request) => {
        const response = await cache.match(request);
        return [new URL(request.url).pathname, response ? (await response.arrayBuffer()).byteLength : 0] as const;
      }));
    }))).flat();
    return Object.fromEntries(entries);
  });
}

test('creates, connects, saves, and reloads a four-panel board', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Plan consistent characters and comic panels' })).toBeVisible();
  await page.getByRole('button', { name: 'Start a blank board' }).click();
  await page.getByLabel('Project name').fill('The Brass Key');
  await page.getByLabel('Story summary').fill('A courier realizes the key is a decoy.');
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'The Brass Key' })).toBeVisible();

  await page.getByRole('button', { name: 'Add first reference' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Mara Vale');
  await page.getByLabel('Role or kind').fill('Courier');
  await page.getByLabel('Source / credit').fill('Original sketch by the table group');
  await page.getByLabel('Appearance details').fill('Teal coat\nBrass key on red cord');
  await page.getByRole('button', { name: 'Save reference' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Mara Vale' })).toBeVisible();

  await page.getByRole('button', { name: 'Edit panel' }).first().click();
  await page.getByLabel('Framing').fill('Close-up');
  await page.getByLabel('Action or panel intent').fill('Mara turns the key over in her hand.');
  await page.getByLabel('Mara Vale').check();
  await page.getByRole('button', { name: 'Save panel' }).click();
  await expect(page.getByText('1 of 4 panels linked')).toBeVisible();
  await expect(page.locator('#save-status')).toHaveText('Saved in this browser');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'The Brass Key' })).toBeVisible();
  await expect(page.getByText('Original sketch by the table group')).toBeVisible();
  await expect(page.getByText('Mara turns the key over in her hand.')).toBeVisible();
  await expect(page.getByText('1 of 4 panels linked')).toBeVisible();
  expect(errors).toEqual([]);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['critical', 'serious'].includes(item.impact || ''))).toEqual([]);
});

test('remains usable offline after first load', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start a blank board' }).click();
  await page.getByLabel('Project name').fill('Offline Proof');
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.locator('#save-status')).toHaveText('Saved in this browser');
  const cachedAssets = await waitForOfflineControl(page);
  expect(cachedAssets['/']).toBeGreaterThan(500);
  const cachedJavaScript = Object.entries(cachedAssets).find(([path]) => /^\/assets\/index-[\w-]+\.js$/.test(path));
  const cachedStyles = Object.entries(cachedAssets).find(([path]) => /^\/assets\/index-[\w-]+\.css$/.test(path));
  expect(cachedJavaScript?.[1]).toBeGreaterThan(10_000);
  expect(cachedStyles?.[1]).toBeGreaterThan(10_000);
  expect(cachedAssets['/assets/continuity-desk-480.avif']).toBeGreaterThan(10_000);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Offline Proof' })).toBeVisible();
  await expect(page.getByText('Offline · local changes work')).toBeAttached();
  await page.getByRole('button', { name: 'Add prop' }).click();
  await page.getByLabel('Prop name').fill('Signal lantern');
  await page.getByRole('button', { name: 'Save prop' }).click();
  await expect(page.locator('#save-status')).toHaveText('Saved in this browser');
  await page.reload();
  await expect(page.getByText('Signal lantern')).toBeVisible();
  expect(errors).toEqual([]);
});
