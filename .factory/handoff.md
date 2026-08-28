# Continuity Board — repair handoff

Repair completed for work order `comic-reference-sheet-board-repair-2` on 2026-08-28. The source report is `.factory/verification.md` at `76f643c5d1943173d12e1dafa90648a2b8b00a0f`; it tested failed candidate `14148d570f92e73766ac75d9bd854ebb4a36a7d5`. That report remains the historical independent verdict, while this document records the repaired release.

## Findings repaired

- **Critical — candidate/live mismatch:** the repaired static artifact was deployed to the canonical URL. Local and live SHA-256 values now match exactly: JS `a2188ec1d9f0ea164ac94187b205c1c6be9c1c2a245d3b0ae6031374e8e84021`, CSS `06a9058ef5b238e62d8dbe63e2c16bf3ec5754c4e4a499e68c9b0a39d59d5276`, and service worker `d6bea8827325353ac377fa47c8a3011088644f8fdccfdebe4eb7c2343f9c968b`. Live paths are `/assets/index-BncAA3wL.js` and `/assets/index-FxjKa00a.css`.
- **High — Studio close button:** the visible close control is now `type="button"` and explicitly closes the dialog, so the empty required license field cannot invoke native constraint validation. Focus returns to the exact “Add shots with Studio” trigger.
- **Medium — unsolicited first-control reload:** initial `clients.claim()` remains reload-free. Reload is armed only by the user selecting “Update now.” A regression counts exactly one first-load main-frame navigation on desktop and mobile.
- **Low — response policy and caching:** Azure Static Web Apps now serves a strict CSP, restrictive Permissions Policy, `nosniff`, strict referrer policy, and frame denial. The manifest is `application/manifest+json`; HTML, legal pages, legal CSS, manifest, and worker deliberately revalidate; content-hashed production JS/CSS use a one-year immutable policy.
- Production asset names are content-hashed. The versioned `continuity-v8` worker discovers the built asset names from the fetched shell during install, precaches them, removes stale shells on activation, and retains offline fallback behavior.
- The continuity coverage meter now uses semantic `<progress>` markup rather than an inline style, so it works under the strict CSP without console violations.

The prior durable IndexedDB save ordering and offline cache fixes remain intact. The researched brief, risograph visual system, local-first data model, free four-shot workflow, JSON ownership, print/PDF behavior, and static PWA artifact class are unchanged.

## Regression coverage

`tests/e2e/quality.spec.ts` now reproduces the verifier's exact four-shot Studio boundary, clicks the visible close button with the required license field empty, checks dismissal, and checks focus return. It also counts first-control navigations, verifies content-hashed assets, validates the response-policy artifact, asserts no inline styles, checks reduced motion and horizontal fit, records local-only first-load requests, and covers legal-page accessibility.

`tests/e2e/board.spec.ts` resolves hashed assets in the worker cache and continues to cover committed IndexedDB persistence plus an offline mutation and second offline reload.

## Clean verification evidence

Run from `/work/repo` with Playwright `1.58.2` and its preinstalled Chromium:

```sh
npm ci
npm run build
npm test
npm audit --audit-level=high
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh <url> <evidence-dir>
CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell npx -y lighthouse@12.8.2 <url>
```

- Clean install: 52 packages installed; 0 vulnerabilities. `npm audit --audit-level=high`: 0 vulnerabilities.
- Type/build: `tsc --noEmit` and Vite production build passed; `dist/index.html` is at the root. No separate lint command is configured. Package/consumer validation is not applicable to this static PWA.
- Unit suite: 3/3 passed.
- Browser suite: 12/12 passed (six scenarios in desktop Chromium and at 390 × 844). Coverage includes end-to-end board creation/link/save/reload, offline edit/reload, keyboard operation, dialog focus, legal pages, privacy/local requests, reduced motion, deployment policy, worker identity, and axe.
- Accessibility: local and live axe scans reported 0 serious/critical findings. The factory verifier reported the correct title and `lang=en`, one h1, one main, no missing alt text, no unlabeled buttons, and no console/page errors.
- Privacy: fresh normal loads made 0 cross-origin requests. Source inspection found no analytics, trackers, third-party scripts/styles/fonts, or data sync. Only explicit Sociobot checkout/license actions can call the external billing API.
- PWA/offline: fresh desktop and mobile live contexts installed `continuity-v8`, persisted a board, went offline, and reloaded it successfully. A real `v7-update-fixture` → `v8` browser exercise showed the update toast, exactly one reload after acceptance, and deletion of the stale shell; initial claim caused no reload.
- Response policy: live HTML has CSP and Permissions Policy; JS/CSS are immutable and content-hashed; `sw.js` is `no-cache, no-store, must-revalidate`; legal documents/styles and manifest are `no-cache`; manifest MIME is `application/manifest+json`.
- Budgets: initial JS 28.53 KB (8.83 KB gzip), CSS 18.82 KB (4.90 KB gzip), shipped fonts 68.8 KB, and hero WebP 121.95 KB.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 2.1 s, TBT 0 ms, CLS 0.
- Lighthouse desktop: 100/100/100/100; FCP 0.3 s, LCP 0.5 s, TBT 0 ms, CLS 0.

## Commit, deployment, and live identity

- Repaired artifact tip: `a5c8f4bb46025b96cd814ed43656acb1a629db4f` (`chore: advance repaired PWA shell version`), including repair commits `6d6fcb1`, `e0b8419`, and `a1da873`; pushed to `origin/main` before deployment.
- Final deployment ID: `236c64dc-4db6-4b4b-90dc-a5ec7bfd8fb5` via `/opt/fleet/lib/deploy-static.sh comic-reference-sheet-board /work/repo/dist`.
- Azure Static Web App: `thankful-stone-0e73f5010.7.azurestaticapps.net` in Central US; custom-domain status `Ready`.
- Canonical URL: <https://comic-reference-sheet-board.sociobot.in> returned HTTP 200. Final factory verifier load was 616 ms with correct Continuity Board identity and no errors.
- Live manifest start URL is `/?source=installed&v=8`; live worker identifies `continuity-v8`.

## Known external gap

The Sociobot checkout endpoint for this slug still returns HTTP 404, while the invalid-license verify endpoint responds. Billing product registration/return URL remains an external factory billing-owner task; this repository contains no billing secret and does not configure the payment provider.
