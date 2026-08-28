# Independent verification 2 — FAIL

**Work order:** `comic-reference-sheet-board-verify-2`

**Candidate tested:** `9c04d9804a9d20e797e03b15174eebcb5ee5c866`

**Canonical URL:** <https://comic-reference-sheet-board.sociobot.in>

**Date:** 2026-08-28

**Verdict:** **FAIL** — the live deployment now matches the candidate and the free four-shot PWA works end to end, but the advertised one-time Studio checkout returns HTTP 404. Two mobile contract defects also remain.

This was a fresh independent run from a clean detached worktree. The historical `.factory/verification.md` applies to an older candidate and is not the basis for this verdict.

## Defects by severity

### High — the advertised $12 checkout is unavailable

The visible **Buy Studio for $12** link targets the contractually correct URL, but the production billing service does not have an enabled product for this slug:

```text
GET https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

This blocks every new purchase and therefore blocks the advertised 5–12-shot and duplication unlock. The invalid-license verification endpoint itself returned HTTP 200 with `{ "valid": false, "reason": "invalid" }`, and the app presented the correct quiet rejection message. The free four-shot workflow and export remain available. Resolution appears to require factory billing product registration/enablement rather than a direct payment-provider integration, but the deployed product is not releasable while its purchase CTA is broken.

### Medium — valid maximum-length project names break the 390 px layout

At a 390 × 844 viewport, a project name of exactly the allowed `maxlength=70` containing no spaces is accepted and saved. The document changes from `scrollWidth=390, clientWidth=390` to `scrollWidth=1927, clientWidth=390`. The project `<h2>` itself reports `scrollWidth=1915, clientWidth=366`, producing more than four viewport widths of horizontal overflow. The app recovers with ordinary spaced text, but valid boundary input must wrap or otherwise remain contained.

### Medium — several mobile targets are below the 44 × 44 px contract

On a normal saved board at 390 px, the visible brand link measured 366 × 42 px, **Privacy** measured 49 × 24 px, and **Terms** measured 43 × 24 px. Other visible button/link targets in that state met the minimum. Axe does not flag this policy-level target-size issue, but the attached accessibility/design contract explicitly requires 44 × 44 px targets.

### Low — the hero lacks the required responsive image variants

The 960 × 640 hero has explicit dimensions, high fetch priority, and is only 121.95 KB, so it meets the byte and LCP budgets. It is nevertheless shipped as one WebP URL without `srcset`, `sizes`, an AVIF source/fallback set, or `decoding="async"`, contrary to the attached image/performance delivery requirements.

## Candidate and deployment identity

The prior deployment-only mismatch is resolved. A fresh production build and the live URL matched SHA-256 across all 20 public build files checked (every `dist/` file except deployment-only `staticwebapp.config.json`). Representative hashes:

| Artifact | Candidate/live SHA-256 |
| --- | --- |
| `/` | `0a23ec1c685a44036081e92304de5810a792234649b53af115df1795d110e5a3` |
| `/assets/index-BncAA3wL.js` | `a2188ec1d9f0ea164ac94187b205c1c6be9c1c2a245d3b0ae6031374e8e84021` |
| `/assets/index-FxjKa00a.css` | `06a9058ef5b238e62d8dbe63e2c16bf3ec5754c4e4a499e68c9b0a39d59d5276` |
| `/sw.js` | `d6bea8827325353ac377fa47c8a3011088644f8fdccfdebe4eb7c2343f9c968b` |
| `/manifest.webmanifest` | `e403f48d760f6688a002d8aca20b51c2b77e2fff394a01058bf0948e2a39d327` |

Fonts, icons, hero art, legal pages, offline fallback, sitemap, and robots file also returned HTTP 200 and matched exactly. Live identifies service-worker shell `continuity-v8`, aligned with manifest start URL `/?source=installed&v=8`.

## Clean checkout gates

Run from detached candidate `9c04d98`:

```sh
npm ci
npm audit --audit-level=high
npm run build
npm test
```

- Install/audit: 52 packages; 0 vulnerabilities.
- Exact production build: `tsc --noEmit` and Vite 8.2.2 passed; `dist/` produced.
- Unit tests: 3/3 passed.
- Playwright project suite: 12/12 passed across desktop Chromium and 390 × 844 mobile.
- No lint script is configured; TypeScript checking is included in `npm run build`.
- The detached worktree remained clean after the run. Library/CLI consumer packaging and backend concurrency/health checks are not applicable to this static PWA.

## Independent functional exercise

The following passed against the canonical deployment in fresh browser contexts:

- Required project-name validation kept the dialog open and allowed correction.
- Created **The Brass Key**, added a user-created image reference with role, two locked attributes, and source text, then added and checked a prop.
- Filled all four shot cards with framing, intent, continuity note, reference link, and prop link. Coverage reached **4 of 4 shots linked** and the ready-to-handoff state.
- Rejected an unsupported GIF, then a 4,000,001-byte PNG, with actionable messages; accepted a valid PNG afterward.
- Exported JSON had one credited reference, four panels, and one reference link on every panel. A malformed JSON import was rejected; importing the valid backup recovered successfully.
- Reload retained the full board in IndexedDB. Print media retained `Original sketch by the table group` and hid editing controls, preserving attribution in the print/PDF path.
- The Studio close control dismissed with the required license input empty and returned focus to the opener. An invalid restored license stayed locked and produced the correct message.
- With a synthetic recent cached-valid verdict solely to exercise conditional UI, panels 5–12 could be added, the 12th panel removed the add control, deletion returned to 11, and project duplication worked. This does not cure the unavailable real checkout.
- Confirmation-backed panel deletion, 70-character input acceptance, empty state, normal state, error state, and offline state were exercised.

No console errors or uncaught page errors occurred in these journeys.

## PWA, persistence, and update behavior

- In a fresh live 390 px context, the app installed and controlled the page, persisted an **Offline field notes** board, reloaded offline, accepted an offline **Signal lantern** mutation, and retained it through a second offline reload.
- A controlled local `continuity-v7-shell` → exact candidate `continuity-v8` update displayed **A fresh proof is ready. Update now**. Initial `clients.claim()` caused one initial navigation only; accepting the update caused exactly one reload. The v7 cache was removed and `continuity-v8-shell`/`continuity-v8-runtime` remained.
- Manifest name/display/icons/start URL are complete; the 192/512/maskable PNG dimensions are correct.

## Accessibility, keyboard, and responsive checks

- Independent Playwright axe 4.10.2 scans after the complete desktop journey and on mobile found 0 serious/critical violations. The repository suite also ran axe on board and legal states.
- `/opt/fleet/lib/verify-url.sh` returned HTTP 200 and loaded in 591 ms with the correct title, `lang=en`, exactly one h1, a main landmark, 0 images missing alt, 0 unlabeled buttons, and no console/page errors.
- First Tab focused the skip link with a visible 3 px outline. Enter activated the skip target; dialog Escape/close paths returned focus; keyboard Enter/Space paths passed in the project suite with no trap.
- `prefers-reduced-motion: reduce` reduced the tested transition below 0.001 s.
- The normal empty and saved-board layouts fit at 390 px. The maximum-length defect and undersized targets are recorded above.
- The authored single light treatment, self-hosted type, risograph palette, original-art provenance, motion policy, and asset disclosure are documented in `.factory/design.md` and visually present.

## Privacy, outbound requests, and response policy

- A fresh normal browser load made 0 cross-origin requests. The only observed cross-origin request followed the explicit invalid-license restore and went to `https://api.sociobot.in`.
- Source inspection found no analytics, trackers, remote scripts/styles/fonts, collaboration endpoint, or board-data upload. Board data/images use IndexedDB; only license state uses localStorage. JSON and print exports are client-side.
- CSP allows only self by default and limits connections to self plus the Sociobot API. Live also sends restrictive Permissions Policy, `X-Content-Type-Options: nosniff`, strict referrer policy, HSTS, and frame denial.
- Live cache policy: HTML `no-cache`; hashed JS/CSS `public, max-age=31536000, immutable`; worker `no-cache, no-store, must-revalidate`; manifest/legal pages `no-cache`. Other self-hosted assets currently revalidate after 30 seconds and are also held by the versioned service-worker shell.
- `/privacy/` and `/terms/` return HTTP 200, are local-asset-only, and accurately describe local data, billing, attribution, and user rights.

## Budgets and Lighthouse

Production asset sizes are within contract:

| Budgeted item | Actual | Budget |
| --- | ---: | ---: |
| Initial JS | 28.53 KB raw / 8.83 KB gzip | ≤ 200 KB |
| CSS | 18.83 KB raw / 4.90 KB gzip | ≤ 50 KB |
| Fonts | 68.80 KB total | ≤ 120 KB |
| Hero WebP | 121.95 KB | ≤ 300 KB |

Fresh Lighthouse 12.8.2 against the live URL:

| Profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 97 | 100 | 100 | 100 | 1.1 s | 2.0 s | 0 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.2 s | 0.4 s | 10 ms | 0 |

Lighthouse does not provide a lab INP value without real interaction data; observed interaction paths had no blocking or input delay, and mobile TBT was 0 ms.

## Required next steps

1. Register/enable the production Sociobot billing product and verify checkout → return license → unlock end to end.
2. Add robust wrapping/containment for maximum-length user content and retest project/reference/prop names at 390 px.
3. Expand the brand and footer legal link hit areas to at least 44 × 44 CSS px.
4. Add responsive hero sources (`srcset`/`sizes`, AVIF/WebP/fallback) and asynchronous decoding.
5. Re-run this verification against the repaired commit and unchanged canonical URL.
