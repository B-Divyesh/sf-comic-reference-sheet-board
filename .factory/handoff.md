# Continuity Board — repair handoff

Repair completed for work order `comic-reference-sheet-board-repair-1` on 2026-08-28, starting from failed candidate `14148d570f92e73766ac75d9bd854ebb4a36a7d5`.

## Repaired

- Reproduced the production-preview offline blank screen in `tests/e2e/board.spec.ts`.
- Replaced the 180 ms lossy save debounce with ordered, immediate IndexedDB writes over immutable snapshots. The UI now says `Saved locally` only after the latest transaction commits, so reload assertions cannot accept an in-progress save.
- Removed the unconditional reload on initial service-worker control. Reload now occurs only after the user accepts an available update.
- Fixed Vite preview cache matching: its `Vary: Origin` responses made precached module and stylesheet requests miss while offline. Same-origin cache reads now ignore `Vary`, installation fetches bypass the HTTP cache, and failed non-navigation requests no longer receive an HTML fallback with the wrong MIME type.
- Bumped the shell and installed-app version to `continuity-v6` and retained the static PWA architecture.
- Strengthened the board regression to verify the persisted reference, shot intent, linkage count, and exact committed-save state after reload.
- Strengthened offline coverage to validate non-empty cached HTML/JS/CSS, reload a saved project offline, make another offline edit, save it, and reload it again without console errors.
- Added desktop/mobile keyboard, focus-return, legal-page, axe, local-asset, manifest identity, and update-contract coverage.

The product scope and risograph visual system are unchanged.

## Verification evidence

Commands were run from `/work/repo` with Playwright 1.58.2 and its preinstalled Chromium:

```sh
npm ci && npm run build
npm test
npm audit --audit-level=high
npx playwright test tests/e2e/board.spec.ts --grep 'remains usable offline' --repeat-each=5 --workers=2
npx playwright test tests/e2e/board.spec.ts --grep 'creates, connects' --repeat-each=5 --workers=2
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 <temporary-evidence-dir>
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome npx -y lighthouse@12.8.2 http://127.0.0.1:4173/ --chrome-flags='--headless --no-sandbox'
```

- Exact clean install/build: passed; `dist/index.html` is at the output root.
- Unit suite: 3/3 passed.
- Full Playwright suite: 8/8 passed across desktop Chromium and the 390 × 844 mobile profile. This includes persistence/reload, offline edit/reload, keyboard-only operation, native-dialog focus return, legal/privacy pages, local-only assets, update metadata, and axe scans with zero serious/critical findings.
- Flake regression: offline workflow 10/10 and create/connect/save/reload workflow 10/10 across repeated desktop/mobile runs.
- Preview verifier: HTTP 200 in 536 ms; correct title and `lang=en`; one h1; main present; zero missing alt text, unlabeled buttons, console errors, or page errors.
- Preview routes `/`, `/privacy/`, `/terms/`, `/offline.html`, `/manifest.webmanifest`, and `/sw.js`: HTTP 200 with expected content types.
- Production assets: 28.52 KB JS (8.84 KB gzip), 18.47 KB CSS (4.86 KB gzip), 51.28 KB of requested self-hosted fonts (68.8 KB shipped), and a 121.95 KB WebP hero. Initial JS remains below the 200 KB budget.
- Lighthouse 12.8.2 mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP **1.0 s**, LCP **2.1 s**, CLS **0**, TBT **10 ms**.
- Lighthouse 12.8.2 desktop: **100/100/100/100**; FCP **0.3 s**, LCP **0.5 s**, CLS **0**, TBT **0 ms**.
- Dependency audit: 0 vulnerabilities.
- Runtime privacy inspection: no analytics/tracking and no third-party scripts, styles, or fonts. The only external runtime requests remain explicit Sociobot checkout/license actions.

## Commit, deployment, and live verification

- Repair commit `3d89165` (`fix: make local saves and offline reload durable`) was pushed to `origin/main`.
- `/opt/fleet/lib/deploy-static.sh comic-reference-sheet-board /work/repo/dist` completed successfully using the work-order static configuration.
- Azure Static Web App: `thankful-stone-0e73f5010.7.azurestaticapps.net` (Central US).
- Canonical URL: <https://comic-reference-sheet-board.sociobot.in> — custom-domain status `Ready`, managed HTTPS returned 200.
- Live factory verifier: load 696 ms, correct Continuity Board identity, title/lang/single h1/main, zero missing alt text, zero unlabeled buttons, and zero console/page errors.
- Fresh live desktop and mobile browser contexts both installed the service worker, switched offline, and reloaded the full app shell successfully.
- Live `/privacy/` and `/terms/`: HTTP 200.

## Known external gap

- The live Sociobot checkout endpoint currently returns HTTP 404, so the product slug still needs billing registration and its return URL configured by the factory billing owner. This repository contains no billing secret and does not directly configure billing, DNS, or payment-provider infrastructure.
