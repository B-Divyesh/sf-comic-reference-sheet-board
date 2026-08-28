# Independent verification 3 — PASS

**Work order:** `comic-reference-sheet-board-verify-3`  
**Candidate:** `f979e88f1facfad97afef18fdda68fec126ddb4f`  
**Canonical URL:** <https://comic-reference-sheet-board.sociobot.in>  
**Date:** 2026-08-28  
**Verdict:** **PASS** — the canonical production deployment is byte-for-byte the requested candidate and the local-first four-shot planning/export workflow, PWA, privacy posture, paid-unlock contract, accessibility, and performance checks meet the acceptance contract.

The two preceding reports remain historical: their live mismatch and production-checkout 404 are no longer present.

## Candidate/deployment identity

Built the clean checkout with the exact production command. Every one of the 25 deployable `dist/` files (excluding the deployment-only `staticwebapp.config.json`) matched the canonical URL by SHA-256, including HTML, hashed JS/CSS, source map, fonts, all generated-art variants, icons, legal pages, offline page, manifest, and worker. Representative identities:

| Artifact | SHA-256 |
| --- | --- |
| `/` | `28b6864e9ee7f3f29ee1594a98b9d2fc5f047eb0d8bcb8a1e1ad59347baab823` |
| `/assets/index-DtL38iZN.js` | `6e3f523754c39a78990ca3e2a72d3f182225a1ab579ef5a3f44b072d9c14e23d` |
| `/assets/index-DNUMGa-H.css` | `1551f2dcfab5fa7c3d2435c40d2f8adb96ba28d633982c8c55a8eaa46bcecceb` |
| `/sw.js` | `0573a23a0f8081b9e1e78092598d7dd1fd8058993bee87cf1b2d9d66cda3ec02` |

The live manifest has `display: "standalone"`, 192/512/maskable icons, matching paper colors, and `start_url` `/?source=installed&v=9`; the live worker identifies `continuity-v9`.

## Local gates

Run from this clean checkout:

```sh
npm ci
npm audit --audit-level=high
npm run build
npm test
```

- `npm ci` installed 52 packages; `npm audit --audit-level=high` reported 0 vulnerabilities.
- `npm run build` passed TypeScript `--noEmit` and Vite 8.2.2 and produced `dist/`.
- Vitest passed 4/4; Playwright passed 18/18 across desktop Chromium and the 390 × 844 mobile project. There is no separate lint script; the build performs the repository's TypeScript check.
- Initial JS is 29,072 B raw / 8,947 B gzip (budget 200 KB); CSS is 19,007 B / 4,924 B gzip (budget 50 KB); all shipped WOFF2 fonts total 68,804 B (budget 120 KB); 480 px AVIF hero is 12,473 B (budget 300 KB).

## Independent browser exercise

Fresh desktop live Chromium exercise:

- Created **The Brass Key QA**, added the credited **Mara Vale** reference with locked attributes, added a prop, and completed all four shots with reference links. The meter reached **4 of 4 shots linked** and state survived reload.
- Rejected an `image/gif` upload with “Use a PNG, JPEG, or WebP image,” then accepted a PNG in the same dialog.
- Exported a JSON backup containing a project, reference credit, and four panels. A malformed JSON import showed “That file is not a valid Continuity Board backup”; the valid export imported successfully. Print media retains the attribution and hides the panel action container.
- No page errors, console errors, or normal-load cross-origin browser requests occurred. Normal operation keeps board data in IndexedDB; source inspection confirms only license token/verdict state use localStorage and no analytics, CDN, or collaboration endpoint is present.

On a fresh 390 × 844 context, a 70-character unbroken project name caused neither page nor heading overflow. First Tab focused **Skip to board** with a visible 3 px `#25201d` focus outline; Enter moved focus to `main`. The brand, Privacy, and Terms links measured 366 × 44, 49 × 44, and 44 × 44 CSS pixels. Reduced motion gave a `0.00001s` transition. Independent axe scans on desktop and mobile found **zero serious/critical violations**.

The live title, `lang=en`, single `h1`, main landmark, local legal pages, labels, alt text, and focus/dialog paths were also covered by the 18-test browser suite. The documentation and product accurately state that uploaded references are user-created, local, and exported with supplied attribution; no image generation or copyrighted templates exist in the product.

## PWA and paid unlock

- In a fresh live mobile context, the page became service-worker controlled, cached `/` and the responsive 480 AVIF, reloaded offline, saved an **Offline lantern** prop while offline, and retained both board and prop after a second offline reload. The tested worker has versioned `continuity-v9-shell` caching, offline fallback, `skipWaiting`, `clients.claim`, a “A fresh proof is ready” update toast, and no reload on initial claim (the regression suite passes this case). A literal live V8→V9 update cannot be triggered without changing the already-current deployment; the update implementation and version alignment were inspected rather than fabricating a deployed release.
- `GET /api/v1/products/comic-reference-sheet-board/checkout` now returns **303** to the hosted `checkout.dodopayments.com` session. The client uses the required Sociobot endpoint, not an embedded provider. Invalid-token verification returned HTTP 200 with `{"valid":false,"reason":"invalid","expires_at":null}`. No paid checkout was submitted and no real card data was entered.
- Rate-limit test: a 40-request concurrent burst to the read-only verify endpoint returned **30 × 200** and **10 × 429**. Every observed 429 carried `Retry-After: 3`; the observed limit began after 30 accepted requests in that burst/window.

## Response policy, caching, and performance

Live HTML, manifest, worker, JS/CSS, image, privacy and terms responses were checked. The deployment sends strict self-only CSP (with only the Sociobot API allowed in `connect-src`), Permissions-Policy disabling camera/geolocation/microphone/payment/USB, `nosniff`, `DENY` framing, HSTS, and strict-origin referrer policy. Hashed JS/CSS are `public, max-age=31536000, immutable`; HTML/manifest/legal are `no-cache`; worker is `no-cache, no-store, must-revalidate`; AVIF has the correct `image/avif` MIME type.

Fresh Lighthouse 13.4.1 mobile run against the canonical URL (Chromium with `--headless --no-sandbox`) scored:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 97 | 100 | 100 | 100 | 2.0 s | 2.1 s | 20 ms | 0 |

## Defects and limitations

No release-blocking, high, medium, or low defects found.

The only verification boundary is that a real production service-worker version transition and a paid return `?license=` path require a new deployment and a completed purchase respectively. Both contracts are present and the non-destructive portions were independently exercised; neither is a product defect in this candidate.
