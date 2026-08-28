# Continuity Board — build handoff

Build completed for work order `comic-reference-sheet-board-build-1` on 2026-08-28.

## Shipped

- A local-first multi-project board built with Vite and vanilla TypeScript.
- Four-panel free workflow with reorderable shot cards; Studio unlock expands a project to 12 shots and enables project duplication.
- User-created reference image slots with named appearance locks, role, source/credit, local file validation, and per-shot reference links.
- Prop ledger with state, notes, per-shot links, edit/delete, and specific destructive confirmations.
- Coverage meter showing how many shots have at least one visual reference.
- IndexedDB persistence plus schema-validated JSON export/import. Local data survives refresh, tab close, and install.
- Print/PDF stylesheet that preserves project intent, all shot notes, linked references/props, and source attribution.
- Installable PWA manifest, 192/512/maskable icons, versioned service-worker precache, offline navigation fallback, and in-app update prompt.
- $12 one-time Sociobot license flow: hosted buy link, returned-token capture and URL cleanup, daily verification cache, quiet invalid-license state, optimistic offline access, and pasted-license restore.
- Responsive 390 px treatment, keyboard-operable native dialogs, visible focus, skip link, live save/error status, reduced-motion handling, and no serious/critical axe findings.
- Dedicated `/privacy/` and `/terms/` pages, original image provenance, robots/sitemap, MIT license, and complete README.

## Verification

Run from a clean checkout with Node.js 20+:

```sh
npm ci
npm test
npm run build
```

- `npm test`: 3 Vitest model/import checks and 4 Playwright checks passed across desktop Chromium and a 390 × 844 mobile Chromium profile. The workflow creates a project and reference, links a shot, persists after reload, and passes an axe serious/critical scan. Both profiles also load while `context.setOffline(true)`.
- `npm run build`: passed; output is exactly `dist/` with `dist/index.html` at its root.
- Final production assets: 28.60 KB JS (8.91 KB gzip), 18.53 KB CSS (4.88 KB gzip), 51 KB of requested self-hosted fonts, and a 120 KB WebP hero.
- Lighthouse 12.8.2 mobile, against the final production bundle: Performance **98**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP **1.1 s**, LCP **2.4 s**, CLS **0**, TBT **0 ms**, interactive **2.4 s**.
- Factory `verify-url.sh`: HTTP 200, load 766 ms, title and `lang=en` present, exactly one h1, main landmark present, zero images missing alt, zero unlabeled buttons, and zero console/page errors.
- `npm audit --omit=dev`: 0 production vulnerabilities.
- Direct production-preview checks for `/`, `/privacy/`, `/terms/`, and `/offline.html`: all HTTP 200.

## Product and privacy notes

There is no analytics, account, runtime CDN, third-party font/script, server sync, public gallery, copyrighted character template, style imitation, or in-product image generation. The empty-state risograph illustration was generated specifically for this product with `factory-image`, visually reviewed, optimized, and documented in `.factory/design.md` plus `assets/src/continuity-desk.json`.

The free tier always retains four-shot planning, references and props, local persistence, JSON ownership, and print/PDF export. Existing local work is not removed when a license becomes invalid.

## Known gaps and next steps

- The factory must register the product slug with Sociobot billing and set its checkout return URL before live purchase testing. No product ID or secret is hardcoded.
- Browser print-to-PDF is used rather than a bundled PDF renderer; this keeps the client small and private, but pagination details can vary slightly by browser. The A4 print stylesheet has been visually reviewed.
- Local images share the browser's storage quota. The UI caps each incoming image at 4 MB and tells users to export JSON backups; there is intentionally no cloud recovery.
- Deployment, DNS, billing registration, and live post-deploy verification remain factory responsibilities.
