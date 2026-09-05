import { expect, test, type Browser, type Page } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

async function waitForServiceWorker(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Service worker did not take control')), 8_000);
      navigator.serviceWorker.addEventListener('controllerchange', () => { window.clearTimeout(timeout); resolve(); }, { once: true });
    });
  });
}

async function startRealFromDemo(page: Page) {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start for real' }).first().click();
  await expect(page).toHaveURL('/');
}

async function createProject(page: Page, name: string) {
  await page.getByRole('button', { name: 'Start a blank board' }).click();
  await page.getByLabel('Project name').fill(name);
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await expect(page.locator('#save-status')).toHaveText('Saved in this browser');
}

async function downloadText(download: import('@playwright/test').Download) {
  const stream = await download.createReadStream();
  const decoder = new TextDecoder();
  let text = '';
  for await (const chunk of stream as AsyncIterable<Uint8Array>) text += decoder.decode(chunk, { stream: true });
  return text + decoder.decode();
}

test('@claim:demo-isolation loads, resets, and leaves saved projects unchanged', async ({ page }) => {
  await page.goto('/');
  await createProject(page, 'My saved story');
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Continuity Board');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'The Lantern Exchange' })).toBeVisible();
  await expect(page.getByText('4 of 4 panels linked')).toBeVisible();
  await page.getByRole('button', { name: 'Edit panel' }).first().click();
  await page.getByLabel('Action or panel intent').fill('Changed only inside the sample.');
  await page.getByRole('button', { name: 'Save panel' }).click();
  await expect(page.getByText('Changed only inside the sample.')).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Mara waits alone under the stopped station clock.')).toBeVisible();
  await expect(page.getByText('Changed only inside the sample.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start for real' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'My saved story' })).toBeVisible();
});

test('@claim:four-panel-start creates a free board with four editable panels', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByLabel('Project name').fill('River Market');
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'River Market' })).toBeVisible();
  await expect(page.locator('.panel-card')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Edit panel' })).toHaveCount(4);
});

test('@claim:continuity-tracking records references, attributes, props, and panel links', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 3, name: 'Mara Vale' })).toBeVisible();
  await expect(page.getByText('Teal coat with brass buttons')).toBeVisible();
  await expect(page.getByLabel('Prop checklist').getByText('Brass key', { exact: true })).toBeVisible();
  await expect(page.locator('.panel-card .ref-chip')).toHaveCount(7);
  await expect(page.getByText('4 of 4 panels linked')).toBeVisible();
  await page.getByRole('button', { name: 'Edit panel' }).first().click();
  await expect(page.getByLabel('Mara Vale')).toBeChecked();
  await expect(page.getByLabel('North Gate station')).toBeChecked();
});

test('@claim:json-roundtrip exports and restores a JSON backup', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const saved = JSON.parse(await downloadText(download)) as { projects: Array<{ name: string; panels: unknown[] }> };
  expect(saved.projects[0]).toMatchObject({ name: 'The Lantern Exchange' });
  expect(saved.projects[0].panels).toHaveLength(4);
  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByLabel('Project name').fill('Temporary sample change');
  await page.getByRole('button', { name: 'Save project' }).click();
  await page.getByRole('button', { name: 'Import JSON' }).click();
  await page.locator('#import-input').setInputFiles(path!);
  await expect(page.getByRole('heading', { level: 1, name: 'The Lantern Exchange' })).toBeVisible();
  await expect(page.getByText('Imported 1 project')).toBeVisible();
});

test('@claim:attribution-export includes supplied credit in JSON and print output', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const json = await downloadText(download);
  expect(json).toContain('Original character notes for the sample story');
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByText('Original character notes for the sample story')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit reference' }).first()).toBeHidden();
});

test('@claim:local-private keeps normal demo work on the product origin', async ({ page }) => {
  const crossOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== baseURL) crossOrigin.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Edit panel' }).first().click();
  await page.getByRole('dialog', { name: 'Edit panel 1' }).getByLabel('Continuity note').fill('The key stays in Mara’s right hand.');
  await page.getByRole('button', { name: 'Save panel' }).click();
  await page.getByRole('checkbox', { name: /Canvas bag/ }).check();
  expect(crossOrigin).toEqual([]);
});

test('@claim:product-boundaries offers no accounts, image generation, public gallery, or collaboration flow', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: /sign in|create account|generate image|publish|invite/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /sign in|create account|public gallery/i })).toHaveCount(0);
  await expect(page.getByText('Original character notes for the sample story')).toBeVisible();
});

test('@claim:offline-reload reloads and edits the sample without a connection', async ({ browser }: { browser: Browser }) => {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto('/demo');
  await waitForServiceWorker(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'The Lantern Exchange' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit panel' }).first().click();
  await page.getByRole('dialog', { name: 'Edit panel 1' }).getByLabel('Continuity note').fill('Offline sample edit');
  await page.getByRole('button', { name: 'Save panel' }).click();
  await expect(page.getByText('Offline sample edit')).toBeVisible();
  await context.close();
});

test('@claim:pwa-install registers a standalone app with complete icons', async ({ browser }: { browser: Browser }) => {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto('/demo');
  await waitForServiceWorker(page);
  const manifest = await page.evaluate(async () => fetch('/manifest.webmanifest').then((response) => response.json())) as { display: string; start_url: string; icons: Array<{ sizes: string; purpose?: string }> };
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toContain('v=10');
  expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBeTruthy();
  await context.close();
});

test('@claim:pwa-update shows and applies a controlled version update', async ({ browser }: { browser: Browser }) => {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto('/offline.html');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('/sw-fixture-v9.js');
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    await registration.update();
  });
  await page.goto('/demo');
  await expect(page.getByText('An update is ready.')).toBeVisible({ timeout: 15_000 });
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.getByRole('button', { name: 'Update now' }).click()
  ]);
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'))).toBeTruthy();
  await expect.poll(() => page.evaluate(() => caches.keys())).toContain('continuity-v10-shell');
  await context.close();
});

test('@claim:studio-license accepts a valid fixture and enables paid actions', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/verify?license=fixture-valid', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) }));
  await startRealFromDemo(page);
  await expect(page.getByText('$12 one-time purchase.')).toBeVisible();
  await page.getByRole('button', { name: 'View Studio purchase' }).click();
  await expect(page.getByRole('link', { name: 'Buy Studio for $12' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/checkout');
  await page.getByRole('button', { name: 'Close Studio purchase' }).click();
  await page.goto('/?license=fixture-valid');
  await expect(page).toHaveURL('/');
  await createProject(page, 'Licensed board');
  await expect(page.getByRole('button', { name: 'Studio active' })).toBeVisible();
  for (let count = 4; count < 12; count += 1) await page.getByRole('button', { name: 'Add panel' }).click();
  await expect(page.locator('.panel-card')).toHaveCount(12);
  await page.getByRole('button', { name: 'Duplicate project' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Licensed board copy' })).toBeVisible();
});

test('@claim:license-privacy stores only local license state and caches Sociobot checks for one day', async ({ page }) => {
  let checks = 0;
  await page.route('https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/verify?license=privacy-fixture', async (route) => {
    checks += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await startRealFromDemo(page);
  await page.goto('/?license=privacy-fixture');
  await expect.poll(() => checks).toBe(1);
  const licenseState = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  expect(Object.keys(licenseState).sort()).toEqual(['sb_license:comic-reference-sheet-board', 'sb_license_verdict:comic-reference-sheet-board']);
  expect(licenseState['sb_license:comic-reference-sheet-board']).toBe('privacy-fixture');
  await page.reload();
  await page.waitForTimeout(250);
  expect(checks).toBe(1);
  await expect(page.locator('input[autocomplete="cc-number"], input[name*="card" i]')).toHaveCount(0);
});

test('@claim:license-fallback keeps saved work and export available when Studio becomes inactive', async ({ page }) => {
  let valid = true;
  await page.route('https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/verify?license=fallback-fixture', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid, reason: valid ? 'ok' : 'revoked', expires_at: null }) }));
  await startRealFromDemo(page);
  await page.goto('/?license=fallback-fixture');
  await createProject(page, 'License fallback board');
  await expect(page.getByRole('button', { name: 'Studio active' })).toBeVisible();
  await page.getByRole('button', { name: 'Add panel' }).click();
  await expect(page.locator('.panel-card')).toHaveCount(5);
  valid = false;
  await page.evaluate(() => {
    const key = 'sb_license_verdict:comic-reference-sheet-board';
    const verdict = JSON.parse(localStorage.getItem(key)!);
    localStorage.setItem(key, JSON.stringify({ ...verdict, checkedAt: 0 }));
  });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'License fallback board' })).toBeVisible();
  await expect(page.locator('.panel-card')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add panels with Studio' })).toBeVisible();
  await expect(page.getByText('The license is no longer active. The free board is still available.')).toBeVisible();
});

test('@claim:site-data-clear removes saved projects and license state', async ({ page }) => {
  await startRealFromDemo(page);
  await createProject(page, 'Clear this project');
  await page.evaluate(() => localStorage.setItem('sb_license:comic-reference-sheet-board', 'local-fixture'));
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('continuity-board');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Plan consistent characters and comic panels' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('@claim:multiple-projects keeps and switches between saved projects', async ({ page }) => {
  await startRealFromDemo(page);
  await createProject(page, 'First project');
  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByLabel('Project name').fill('Second project');
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.locator('#save-status')).toHaveText('Saved in this browser');
  await page.getByRole('button', { name: /First project/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'First project' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /First project/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Second project/ })).toBeVisible();
});

test('@claim:accessible-layout supports phone reflow, keyboard focus, and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to board' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  const edit = page.getByRole('button', { name: 'Edit panel' }).first();
  await edit.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Edit panel 1' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(edit).toBeFocused();
  expect(await page.getByRole('button', { name: 'Reset demo' }).evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration) || 0)).toBeLessThan(0.001);
});
