# Continuity Board — repair 4 handoff

## Status: complete

The seven findings in `review-1.md` are fixed, including the two high-severity contract gaps. The deployed implementation is `de9fb1d3463f307a974389482b60e5c726bdd537`. This handoff is a later report-only commit, so it does not require another product deployment; its exact documentation SHA is recorded in the work-order response after the commit exists.

Live URL: <https://comic-reference-sheet-board.sociobot.in>

Deployment ID: `96fc20cb-9958-474e-9dd0-3737bca3cb72`

## What changed

- Added a one-click `/demo` with two original references, three props, and four fully linked panel cards. It runs only in memory, shows the required persistent demo label, resets, and returns to real data without copying sample content.
- Added `.factory/claims.json` with 17 public claims and exactly one outcome-based `@claim:<id>` browser test for each. The update and valid-license paths use controlled fixtures as required.
- Rebuilt the landing page around the job, audience, first action, three short facts, live product preview, three-step workflow, product limits, and exact paid tier.
- Named all five dialogs and added regressions for their accessible roles, keyboard operation, focus return, phone reflow, reduced motion, and axe results.
- Replaced the CSP-blocked inline storage recovery handler with a module-bound action and proved that reload occurs after forced IndexedDB failure.
- Added a designed 404 that returns HTTP 404, plus route titles, descriptions, canonicals, Open Graph and Twitter metadata, social art, Apple icon, sitemap entry, and shared legal-page shell.
- Updated the service worker to version 10, cached `/demo`, and added a shipped version-9 worker fixture that proves the update notice and confirmed activation path.
- Added `.factory/demo.md`, `.factory/copy-audit.md`, and the required catalog description. Updated the README and visual provenance.
- Fixed the remaining landing contrast/name issue and placed the visually hidden import control inside a landmark so full axe scans return zero violations.

## Review finding disposition

| Finding | Disposition and proof |
| --- | --- |
| F1: no isolated demo | Fixed. Direct `/demo` loads realistic data. Fresh desktop and phone contexts show 2 references, 3 props, 4 panels, and 4 linked panels before and after reset. IndexedDB, localStorage, and sessionStorage remain empty. Only the product origin is requested. |
| F2: no claims register | Fixed. `.factory/claims.json` contains 17 entries and each exact command passes from the clean checkout. The suite includes controlled worker-update and valid-license fixtures. |
| F3: first-screen/site structure | Fixed. The h1 states the job; the next sentence names tabletop groups and hobby comic makers; the sample action, result, three facts, preview, workflow, limits, pricing, navigation, factory credit, and build ID are present on desktop and phone. Copy audit has no sentence over 22 words and no banned term. |
| F4: unnamed dialogs | Fixed. Project, reference, prop, panel, and Studio dialogs expose heading-derived accessible names. Keyboard open, Escape, save, and focus-return paths pass. |
| F5: CSP-blocked recovery | Fixed. Forced IndexedDB failure shows the recovery page; **Reload board** causes a second main-frame navigation with no console error. |
| F6: no real 404 | Fixed. An unknown URL returns HTTP 404 with the designed page, its own title and h1, main landmark, and home link. |
| F7: incomplete metadata/legal shell | Fixed. Root and demo metadata are route-specific. Privacy, terms, and 404 use the shared branded shell. Sitemap, social image, favicon, and Apple icon are present. |

## Earlier verification history

All earlier issues were rechecked, not treated as superseded by the latest report.

| Earlier issue | Current result |
| --- | --- |
| Candidate/live mismatch | Fixed. Representative live HTML, JS, CSS, and worker SHA-256 values match the clean `de9fb1d` build exactly. |
| Studio dialog could not close with an empty field | Fixed and covered by browser regression. |
| First worker control caused an unprompted reload | Fixed; the regression observes one initial navigation. |
| Missing security/cache headers and manifest MIME | Remain fixed in the durable static deployment configuration. |
| Product checkout returned 404 | Remains fixed; the product uses only the Sociobot product checkout URL. |
| Maximum-length mobile name overflow | Fixed at 390 px and covered by browser regression. |
| Brand/footer targets below 44 px | Fixed and measured by browser regression. |
| Missing responsive hero variants | Fixed with local AVIF, WebP, and JPEG source sets. |
| Worker update path was untested | Fixed with the shipped old-worker fixture; the test observes the notice, confirms, and verifies the v10 controller/cache. |
| Valid paid return was untested | Fixed with a recorded valid Sociobot response fixture; the test accepts the return token, reaches 12 panels, and duplicates a project. No paid checkout was submitted. |

## Clean verification

The final implementation was checked from a detached clean checkout at `/work/continuity-verify-de9fb1d`.

```sh
npm ci
npm audit --audit-level=high
npm run build
npm test
```

- `npm ci`: 52 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm run build`: TypeScript and Vite passed; `dist/` produced.
- `npm test`: Vitest 4/4 and Playwright 56/56 passed across desktop Chromium and the 390 × 844 mobile project.
- Every exact command declared in `.factory/claims.json`: 17/17 passed from the same clean checkout.
- Initial JS: 35,770 bytes raw / 10.91 KB gzip.
- CSS: 22,470 bytes raw / 5.61 KB gzip.
- Fonts: 68,804 bytes total.
- 480 px AVIF hero: 12,473 bytes.

Local Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; FCP 0.9 s, LCP 2.0 s, TBT 0 ms, CLS 0.

Evidence:

- `/work/.evidence/npm-test-clean-de9fb1d.log`
- `/work/.evidence/claims-clean-de9fb1d.log`
- `/work/.evidence/lighthouse-local-de9fb1d.json`
- `/work/.evidence/local-verify-de9fb1d/`

## Live verification

Fresh desktop and 390 × 844 phone contexts were opened against HTTPS after deployment.

- The first screen states the job, audience, first action, outcome, privacy, offline behavior, and price before scrolling. Both layouts have no horizontal overflow or console errors.
- Direct `/demo` has the correct route title, sample h1, persistent label, complete sample, working reset, product-origin-only requests, and no IndexedDB or web-storage state.
- A live demo reload and edit succeeded with the browser offline after worker control.
- Forced IndexedDB failure showed the recovery screen; its button reloaded the app without a CSP error.
- Root, demo, privacy, terms, and the deliberate 404 have zero axe violations.
- `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html` return 200. A random missing URL returns the expected HTTP 404.
- The root, built JS, built CSS, and worker response hashes match the clean candidate.

Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 0 ms, CLS 0.

Evidence:

- `/work/.evidence/live-de9fb1d/`
- `/work/.evidence/lighthouse-live-de9fb1d.json`
- `/work/.evidence/catalog-description.txt`

## Run locally

```sh
npm ci
npm run dev
```

Use `npm test` for all unit and browser checks, or execute each command in `.factory/claims.json` for the public-claim audit. Use `npm run build` to create `dist/`.

## Known boundaries

- No real purchase was made. Billing stays on the external Sociobot checkout. The valid return and revoked-license behaviors are tested with deterministic response fixtures, as required by the claims contract.
- The product is a static local-first PWA. Backend tenant isolation, server restart persistence, health routes, server rate limiting, SQLite, CLI, library, and desktop-package checks do not apply.
- Demo changes intentionally disappear on reload. Real projects remain in the browser's IndexedDB and can be backed up with JSON.
