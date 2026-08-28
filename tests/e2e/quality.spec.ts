import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('supports the complete keyboard path without a focus trap', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to board' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  const start = page.getByRole('button', { name: 'Start a four-panel board' });
  await start.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(start).toBeFocused();

  await page.keyboard.press('Enter');
  await page.getByLabel('Project name').fill('Keyboard Story');
  const save = page.getByRole('button', { name: 'Save project' });
  await save.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { level: 2, name: 'Keyboard Story' })).toBeVisible();
  await expect(page.locator('#save-status')).toHaveText('Saved locally');
});

test('ships accessible legal pages, local assets, and aligned PWA identity', async ({ page, request }) => {
  const manifestResponse = await request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json() as { name: string; start_url: string; display: string };
  expect(manifest).toMatchObject({ name: 'Continuity Board', display: 'standalone' });

  const workerResponse = await request.get('/sw.js');
  expect(workerResponse.ok()).toBeTruthy();
  const worker = await workerResponse.text();
  const version = worker.match(/const VERSION = 'continuity-v(\d+)'/)?.[1];
  expect(version).toBeTruthy();
  expect(manifest.start_url).toContain(`v=${version}`);
  expect(worker).toContain("event.data === 'SKIP_WAITING'");

  for (const path of ['/privacy/', '/terms/']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Continuity Board/);
    const externalAssets = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll((elements) => elements
      .map((element) => element.getAttribute('src') || element.getAttribute('href') || '')
      .filter((url) => new URL(url, location.href).origin !== location.origin));
    expect(externalAssets).toEqual([]);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['critical', 'serious'].includes(item.impact || ''))).toEqual([]);
  }
});
