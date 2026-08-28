# Continuity Board — repair handoff

## Repair status

Work order `comic-reference-sheet-board-repair-3` repaired the code-level findings reported for candidate `9c04d9804a9d20e797e03b15174eebcb5ee5c866` and retained the Vite/TypeScript static offline PWA artifact. The production checkout registration remains a factory billing configuration blocker: immediately before this repair, `GET https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/checkout` returned `404 {"error":"enabled factory product","status":404}`. The client already uses the required Sociobot endpoint and must not bypass it with a direct payment-provider integration.

## What changed

- Contained unbroken user project names with `min-width: 0` and `overflow-wrap: anywhere`; the exact 70-character boundary input no longer creates horizontal overflow at 390 × 844.
- Made the masthead brand link and the Privacy/Terms links at least 44 × 44 CSS pixels.
- Delivered the original generated risograph illustration as responsive 480/960 AVIF and WebP sources with JPEG fallback, `srcset`, `sizes`, explicit intrinsic dimensions, high priority, and async decoding. Provenance and the responsive derivation are recorded in `.factory/design.md`.
- Added the AVIF MIME/route exclusion and advanced the PWA shell and installed-app URL together from `continuity-v8` to `continuity-v9`; every responsive art variant is precached for offline use.
- Added regression coverage for the exact checkout URL, 70-character 390 px layout, all three hit areas, responsive source delivery, AVIF response policy, and offline precaching.

## Verification

Run from this checkout:

```sh
npm ci
npm audit --audit-level=high
npm test
npm run build
```

Evidence from 2026-08-28:

- Clean `npm ci`: 52 packages installed; `npm audit --audit-level=high`: 0 vulnerabilities.
- Unit tests: 4/4 passed, including the product-specific checkout URL contract.
- Playwright: 18/18 passed across desktop Chromium and the 390 × 844 mobile project. This includes keyboard dialog/focus paths, axe serious/critical scans, local-first persistence, offline reload and mutation, service-worker control, legal pages, reduced motion, and the new boundary/mobile/image regressions.
- `npm run build`: TypeScript `--noEmit` and Vite passed; `dist/index.html` is at the static root. Initial app JS is 29.07 KB raw / 8.98 KB gzip and CSS is 19.00 KB raw / 4.93 KB gzip.
- Factory URL smoke test against the built preview returned HTTP 200 in 540 ms with the correct title/lang, one h1, main landmark, no missing image alt text, no unlabeled buttons, and no page/console errors.
- Privacy/response-policy regression coverage confirms local-only normal load, strict static-site CSP configuration, AVIF MIME mapping, and the required PWA cache/update contract. No library/CLI consumer package or backend health/concurrency test applies to this static PWA.

## Deployment and known gap

Deploy `dist/` with `/opt/fleet/lib/deploy-static.sh comic-reference-sheet-board dist`. The static deployment does not register billing products. Before release acceptance, the factory must enable/register the one-time product with slug `comic-reference-sheet-board` in the Sociobot billing engine, then verify that the checkout endpoint redirects to hosted checkout and that its return `?license=` unlocks Studio. Existing invalid-license verification, restore flow, free four-shot workflow, export, privacy behavior, and the paid-unlock client contract remain intact.
