# Independent verification — FAIL

**Work order:** `comic-reference-sheet-board-verify-1`  
**Candidate tested:** `14148d570f92e73766ac75d9bd854ebb4a36a7d5` (`chore: update verified build tooling`)  
**Canonical URL checked:** <https://comic-reference-sheet-board.sociobot.in>  
**Date:** 2026-08-28  
**Verdict:** **FAIL** — the canonical deployment is not this candidate, and the candidate has a reproducible dismissal failure in its Studio dialog.

This is an independent verification of the supplied SHA. The currently deployed app is a later repair, not evidence that candidate `14148d5` is releasable.

## Release blockers

### Critical — live deployment does not match the candidate

The exact candidate was built locally. Its output hashes were:

| Artifact | Candidate SHA-256 | Live SHA-256 | Result |
| --- | --- | --- | --- |
| `assets/app.js` | `74bc2fb7b606ee7e6a2546fdf6568291358ab18cc5438d05a59054b3e3f7e79d` | `772d1ace10fc9c2ac54297f59af1cf851ce203169ec463de84965a9efcf6912d` | Different |
| `sw.js` | `fde68d519b38bdaffa4b77a83dfc71e54a9c9e27341b71eceb8e516059df6fef` | `c2e1e50ed0c0e63a422d5c5dd35ac948b5eb2920c9313625d247a8e2f75ff578` | Different |
| `assets/app.css` | `9652a6f78b4d7c4e7e8bd1ce8d27dc29dceb4cc911ec29ffebae8ac8b163716c` | Same | Not sufficient |

The candidate manifest/service worker identify shell version `v3`; live identifies `v6`. Therefore the URL cannot be approved as a deployment of the requested candidate.

### High — Studio dialog's visible close button cannot close the dialog

At four panels, selecting **Add shots with Studio** opens the Studio dialog. Its visible `Close Studio unlock` control is a submit button in a `method="dialog"` form whose license input is `required`. Native constraint validation prevents that submit, so the dialog remains open. A fresh Playwright run clicked the control and observed `dialog.open === true`; Escape did close it. A visible close control must work without requiring a license token.

## Other defects

### Medium — initial service-worker control reloads the page unprompted

In a fresh browser context, first load of the candidate produced **two** main-frame navigations rather than one. `navigator.serviceWorker.controllerchange` unconditionally calls `location.reload()`, including the first `clients.claim()` event. This can interrupt first-use work and is not an accepted-update-only reload.

### Low — live response policy/caching hardening is incomplete

The checked canonical response provides HSTS, `nosniff`, and a strict referrer policy, but no `Content-Security-Policy` or `Permissions-Policy`. HTML, JS, CSS, service worker, manifest, and legal pages all use `Cache-Control: public, must-revalidate, max-age=30`; JS/CSS are not content-hashed. The live manifest is served as `application/octet-stream`. These are deployment observations, not the cause of the candidate mismatch.

## What passed on the exact candidate

Ran from a clean detached checkout of `14148d5`:

```sh
npm ci
npm test
npm run build
```

- Clean install: 0 dependency vulnerabilities reported by npm.
- Tests: Vitest **3/3** and Playwright **4/4** passed (desktop and 390 × 844 mobile profiles).
- Typecheck/build: passed; `dist/` was produced.
- No separate lint script exists in `package.json`; TypeScript checking is part of `npm run build`.
- Lighthouse 12.8.2 local mobile preview: Performance **96**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.4 s, LCP 2.4 s, TBT 130 ms, CLS 0.
- Budget: JS 28,448 B (8,738 B gzip), CSS 18,470 B (4,850 B gzip), shipped WOFF2 68,804 B, hero WebP 121,954 B. All are within the stated static-product budgets.

Independent browser exercise on the local production preview covered:

- Desktop normal path: create a four-panel board; add a credited, user-created reference; add/toggle a prop; link all four shots; confirm 4/4 coverage; export JSON; reload and retain contents.
- Boundary and recovery: required project name; unsupported GIF; 4,000,001-byte image; malformed backup; then successful valid-backup import. Each error gave the expected recovery message and kept the board usable.
- Export contains the supplied attribution and all four panels.
- 390 px viewport had no horizontal overflow. Reduced-motion computed transition duration was effectively zero (`1e-05s`).
- Keyboard first Tab reached the skip link with a visible non-zero outline. Axe found **0** serious/critical violations. No console or page errors occurred.
- Without a license token, all local browser requests stayed on the preview origin. Source inspection found local IndexedDB board storage, localStorage only for license state, self-hosted fonts, no analytics/tracker/CDN, and external Sociobot requests only for explicit checkout/license verification.
- PWA: offline reload after precache, an offline prop mutation, and a second offline reload all worked. A controlled `v3` → `v4-test` service-worker update presented “A fresh proof is ready. Update now”; accepting it installed the new cache and reloaded. The unsolicited first-control reload above remains a defect.

## Live checks

Fresh desktop and 390 px live contexts each had one h1, one main landmark, `lang="en"`, the correct title, no horizontal overflow, no console/page errors, no third-party normal-load requests, and 0 axe serious/critical findings. Live service-worker offline reload worked. These checks apply to the later live build only; they do not cure the candidate/deployment mismatch.

## Required next steps

1. Do not promote `14148d5` as the deployed release.
2. Fix the Studio close button (`type="button"` plus explicit `dialog.close()`, or make it exempt from validation) and make initial service-worker control not reload.
3. Deploy the intended, immutable candidate and repeat hash comparison at the canonical URL.
4. Add CSP/Permissions Policy and use correctly typed, versioned assets with a deliberate caching policy.
