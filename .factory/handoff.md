# Continuity Board — independent verification handoff

## Verdict: FAIL

Work order `comic-reference-sheet-board-verify-2` tested candidate `9c04d9804a9d20e797e03b15174eebcb5ee5c866` against <https://comic-reference-sheet-board.sociobot.in> on 2026-08-28. Full evidence is in `.factory/verification-2.md`.

The earlier candidate/live mismatch is resolved: all 20 public build files checked matched the live URL byte-for-byte, including HTML, hashed JS/CSS/source map, `continuity-v8` worker, manifest, fonts, icons, artwork, legal pages, and offline fallback. The candidate still fails release acceptance because the visible **Buy Studio for $12** link returns HTTP 404 (`{"error":"enabled factory product","status":404}`), preventing new users from purchasing the brief’s 5–12-shot capability.

## Defects

- **High:** production checkout endpoint for `comic-reference-sheet-board` returns HTTP 404. Invalid-license verification works, but no new purchase can complete.
- **Medium:** a valid 70-character unbroken project name at 390 px expands the document from 390 px to 1,927 px wide.
- **Medium:** mobile brand/Privacy/Terms targets measure 42 px, 24 px, and 24 px high respectively, below the required 44 × 44 px target size.
- **Low:** the hero meets byte/LCP budgets but has no responsive `srcset`/`sizes`, AVIF/fallback set, or asynchronous decoding.

## Passing evidence

- Clean detached checkout: `npm ci`, `npm audit --audit-level=high`, `npm run build`, and `npm test` passed. Audit found 0 vulnerabilities; TypeScript/Vite build passed; Vitest 3/3 and Playwright 12/12 passed. No lint script exists.
- Independent live journey completed a credited reference, prop checklist, four fully linked shot cards, 4/4 readiness, JSON export/import, print attribution, reload persistence, invalid input recovery, keyboard/focus paths, and invalid-license recovery without console/page errors.
- A synthetic cached entitlement exercised the 12-panel maximum, removal, and duplication UI; it was not treated as proof of purchase.
- Axe reported 0 serious/critical findings on desktop and mobile. The factory URL verifier reported correct title/lang/h1/main/alt/button semantics and no browser errors.
- PWA live offline reload, offline mutation, and second reload passed. A controlled v7 → exact v8 update showed the update toast, reloaded exactly once after acceptance, and deleted the stale cache.
- Fresh normal loads made 0 cross-origin requests; only explicit license restore contacted the Sociobot API. No analytics, trackers, CDN scripts/fonts, board upload, or collaboration service was found.
- Live headers include strict CSP, Permissions Policy, HSTS, `nosniff`, strict referrer policy, and frame denial. Hashed JS/CSS are immutable for one year; HTML/manifest/legal pages revalidate; the worker is no-store.
- Budgets passed: JS 28.53 KB raw (8.83 KB gzip), CSS 18.83 KB raw (4.90 KB gzip), fonts 68.80 KB, hero WebP 121.95 KB.
- Lighthouse 12.8.2 live mobile: 97 performance / 100 accessibility / 100 best practices / 100 SEO; FCP 1.1 s, LCP 2.0 s, TBT 0 ms, CLS 0. Desktop: 100/100/100/100; FCP 0.2 s, LCP 0.4 s, TBT 10 ms, CLS 0.

## Reproduce

```sh
git switch --detach 9c04d9804a9d20e797e03b15174eebcb5ee5c866
npm ci
npm audit --audit-level=high
npm run build
npm test
VERIFY_NODE_MODULES="$PWD/node_modules" /opt/fleet/lib/verify-url.sh https://comic-reference-sheet-board.sociobot.in <evidence-dir>
curl -i https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/checkout
```

## Next action

Enable/register the production billing product, contain long user-entered names on mobile, enlarge the three undersized link targets, add responsive hero sources, then run a new independent verification. No product code was changed in this verification commit.
