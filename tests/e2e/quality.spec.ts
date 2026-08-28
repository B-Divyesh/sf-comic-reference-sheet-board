import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function waitForServiceWorkerControl(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Service worker did not take control')), 5_000);
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
    });
  });
}

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

test('closes the Studio dialog with an empty required license field', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start a four-panel board' }).click();
  await page.getByLabel('Project name').fill('Four-shot limit');
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.locator('#save-status')).toHaveText('Saved locally');
  await expect(page.locator('[style]')).toHaveCount(0);

  const openStudio = page.getByRole('button', { name: 'Add shots with Studio' });
  await openStudio.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel('Have a license? Paste it here')).toBeEmpty();
  await page.getByRole('button', { name: 'Close Studio unlock' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(openStudio).toBeFocused();
});

test('keeps the Studio purchase CTA on the product-specific Sociobot checkout contract', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#unlock-dialog a', { hasText: 'Buy Studio for $12' })).toHaveAttribute(
    'href',
    'https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/checkout'
  );
});

test('contains a maximum-length project name and keeps every required mobile link target usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start a four-panel board' }).click();
  const maximumName = 'A'.repeat(70);
  await page.getByLabel('Project name').fill(maximumName);
  await expect(page.getByLabel('Project name')).toHaveValue(maximumName);
  await page.getByRole('button', { name: 'Save project' }).click();

  const title = page.getByRole('heading', { level: 2, name: maximumName });
  await expect(title).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
  expect(await title.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBeTruthy();

  for (const target of [
    page.getByRole('link', { name: /Continuity Board/ }),
    page.getByRole('link', { name: 'Privacy' }),
    page.getByRole('link', { name: 'Terms' })
  ]) {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('delivers the opening artwork as responsive AVIF, WebP, and JPEG sources', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const art = page.locator('.hero-art');
  await expect(art.locator('source[type="image/avif"]')).toHaveAttribute('srcset', /continuity-desk-480\.avif 480w.*continuity-desk-960\.avif 960w/);
  await expect(art.locator('source[type="image/webp"]')).toHaveAttribute('srcset', /continuity-desk-480\.webp 480w.*continuity-desk\.webp 960w/);
  await expect(art.locator('img')).toHaveAttribute('decoding', 'async');
  await expect(art.locator('img')).toHaveAttribute('srcset', /continuity-desk-480\.jpg 480w.*continuity-desk-960\.jpg 960w/);

  for (const path of [
    '/assets/continuity-desk-480.avif', '/assets/continuity-desk-960.avif',
    '/assets/continuity-desk-480.webp', '/assets/continuity-desk.webp',
    '/assets/continuity-desk-480.jpg', '/assets/continuity-desk-960.jpg'
  ]) expect((await request.get(path)).ok()).toBeTruthy();
});

test('does not reload when the service worker first claims the page', async ({ page }) => {
  let mainFrameNavigations = 0;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) mainFrameNavigations += 1;
  });

  await page.goto('/');
  await waitForServiceWorkerControl(page);
  await page.waitForTimeout(250);

  expect(mainFrameNavigations).toBe(1);
});

test('ships accessible legal pages, local assets, and aligned PWA identity', async ({ page, request }) => {
  const externalRequests: string[] = [];
  page.on('request', (browserRequest) => {
    if (new URL(browserRequest.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(browserRequest.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
  expect(await page.getByRole('button', { name: 'Start a four-panel board' }).evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(0.001);
  expect(externalRequests).toEqual([]);

  const indexResponse = await request.get('/');
  const index = await indexResponse.text();
  expect(index).toMatch(/\/assets\/index-[\w-]+\.js/);
  expect(index).toMatch(/\/assets\/index-[\w-]+\.css/);
  expect(index).not.toContain('/assets/app.js');

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

  const deploymentConfigResponse = await request.get('/staticwebapp.config.json');
  const deploymentConfig = await deploymentConfigResponse.json() as {
    globalHeaders: Record<string, string>;
    mimeTypes: Record<string, string>;
    routes: Array<{ route: string; headers: Record<string, string> }>;
  };
  expect(deploymentConfig.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(deploymentConfig.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(deploymentConfig.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  expect(deploymentConfig.mimeTypes['.avif']).toBe('image/avif');
  expect(deploymentConfig.routes).toEqual(expect.arrayContaining([
    expect.objectContaining({ route: '/assets/index-*', headers: expect.objectContaining({ 'Cache-Control': expect.stringContaining('immutable') }) }),
    expect.objectContaining({ route: '/sw.js', headers: expect.objectContaining({ 'Cache-Control': expect.stringContaining('no-store') }) }),
    expect.objectContaining({ route: '/privacy/*', headers: expect.objectContaining({ 'Cache-Control': 'no-cache' }) }),
    expect.objectContaining({ route: '/terms/*', headers: expect.objectContaining({ 'Cache-Control': 'no-cache' }) }),
    expect.objectContaining({ route: '/legal.css', headers: expect.objectContaining({ 'Cache-Control': 'no-cache' }) })
  ]));

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
