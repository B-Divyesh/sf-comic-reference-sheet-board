# Verification 4: Plan consistent characters and comic panels

## Verdict

**PASS**

- Findings: **0** — 0 critical, 0 high, 0 medium, 0 low.
- Untested public claims: **0**.
- Live URL: <https://comic-reference-sheet-board.sociobot.in>
- Implementation reviewed: `de9fb1d3463f307a974389482b60e5c726bdd537`
- Documentation reviewed: `0328191a8a05e800b4d0c129069e0455e56001da`
- Review date: September 5, 2026.

The live site is byte-for-byte the supplied implementation. The core planning, sample, local storage, export, offline, accessibility, recovery, paid-license fixture, legal, metadata, and not-found paths pass. No product code was changed.

## First screen before scrolling

- Job: plan consistent character appearance, props, and comic panels.
- Audience: tabletop groups and hobby comic makers making a short story.
- First action: **Try it with sample data**. The next line says that it opens a completed four-panel example and does not change projects.

Fresh 1440 × 900 desktop and 390 × 844 phone browsers showed all three points before scrolling. They also showed the three facts about browser storage, offline use, and the free and paid limits. Both layouts had no horizontal overflow. Screenshots are in `/work/.evidence/verify-4/desktop-first-screen.png` and `/work/.evidence/verify-4/phone-first-screen.png`.

## Clean checkout and declared claims

The exact implementation was checked in a detached clean worktree at `/work/continuity-verify4-de9fb1d`.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 52 packages installed; 0 vulnerabilities. |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities. |
| `npm run build` | PASS — TypeScript and Vite completed; `dist/` contains 30 files. |
| `npm test` | PASS — 4/4 unit tests and 56/56 browser tests. |

`.factory/claims.json` has 17 unique entries. Source inspection found exactly one `@claim:<id>` test for each entry. Every declared command was then run separately, exactly as written:

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolation` | PASS | Populated sample reset and returned to an unchanged saved project. |
| `four-panel-start` | PASS | A new free sample board had four editable panels. |
| `continuity-tracking` | PASS | References, attributes, props, links, and coverage were present. |
| `json-roundtrip` | PASS | Exported JSON restored the sample after a workspace change. |
| `attribution-export` | PASS | Supplied credit appeared in JSON and print media. |
| `local-private` | PASS | A sample edit made no cross-origin request. |
| `product-boundaries` | PASS | No account, generation, gallery, publishing, or invitation action exists. |
| `offline-reload` | PASS | A fresh controlled sample reloaded and edited offline. |
| `pwa-install` | PASS | The standalone manifest, version, 192/512 icons, and maskable icon passed. |
| `pwa-update` | PASS | The shipped version-9 fixture showed the update notice and activated version 10 only after confirmation. |
| `studio-license` | PASS | A deterministic valid response fixture enabled panels 5–12 and duplication. |
| `checkout-contract` | PASS | The link uses the product Sociobot endpoint and no card form is embedded. |
| `license-privacy` | PASS | Only namespaced license state was stored; one-day verification caching passed. |
| `license-fallback` | PASS | A revoked fixture removed paid actions while preserving the project and JSON export. |
| `site-data-clear` | PASS | Clearing IndexedDB and localStorage removed the project and license state. |
| `multiple-projects` | PASS | Two projects survived switching and reload. |
| `accessible-layout` | PASS | 390 px reflow, keyboard focus, dialog operation, focus return, and reduced motion passed. |

The command transcript is `/work/.evidence/verify-4/claim-commands.log`. A manual audit of the live page, legal pages, README, and product controls found no public behavior claim missing from the register.

## Live sample and main workflow

In a fresh desktop browser, a real project named **Live continuity QA** was saved first. The one-click sample then showed **The Lantern Exchange**, two references, three props, four filled panel cards, supplied credits, and **4 of 4 panels linked**. The persistent label read **Demo — sample data, nothing is saved**.

Editing a sample panel changed only the sample. **Reset demo** restored the original first panel. IndexedDB was byte-equivalent before and after sample editing, and the sample wrote nothing to localStorage or sessionStorage. **Start for real** returned to the unchanged saved project.

The real workflow also passed:

- An empty required project name was rejected and remained correctable.
- A valid 70-character unbroken name stayed within the 390 px layout.
- A GIF produced the expected file-type message; a PNG then saved in the same dialog.
- A credited reference, two appearance details, and a prop saved successfully.
- All four panels accepted framing, intent, continuity notes, reference links, and prop links.
- Coverage reached **4 of 4 panels linked**.
- JSON contained four panels and the supplied credit.
- Malformed JSON showed a recovery message; the valid backup restored the project.
- Print media kept the credit and removed editing controls.
- The completed real project survived reload.
- Forced IndexedDB failure showed the storage recovery screen. **Reload board** caused a new navigation without a CSP error.

Normal load and this full free workflow made no cross-origin requests. No unexpected console error or uncaught page error occurred.

## Phone, keyboard, accessibility, and motion

Fresh phone checks used 390 × 844, touch input, and reduced motion.

- The page fit without horizontal overflow. Brand, Privacy, and Terms measured at least 44 × 44 CSS pixels.
- The first Tab reached **Skip to board** with a 3 px solid focus ring. Enter focused `main`.
- Keyboard Enter opened the named **Edit panel 1** dialog. Escape closed it and restored focus.
- Text at 200% retained the content without horizontal page overflow.
- Reduced motion gave the tested control a `0.00001s` transition.
- The viewport allows zoom; it does not set `user-scalable=no` or `maximum-scale=1`.
- Playwright axe reported zero violations, including zero serious or critical violations, on root, desktop sample, phone sample, privacy, terms, the direct 404 page, and a missing URL.
- The factory URL verifier passed with one h1, `lang=en`, a main landmark, no missing alt text, no unlabeled buttons, and no console errors.

The visual inspection also confirmed the product-specific risograph layout, self-hosted type, clear hierarchy, and the original sample artwork described in `.factory/design.md`.

## Offline, install, update, and persistence

A fresh live phone browser became service-worker controlled, switched offline, reloaded `/demo`, and saved an offline panel edit. The exact local claim test independently proved manifest installation and the controlled version-9 to version-10 update path.

The initial worker claim caused one main-frame navigation only. The update prompt applies a waiting worker only after the user selects **Update now**. Real projects use IndexedDB and survive reload. The sample remains in memory and intentionally resets on navigation or reload.

## Routes, links, metadata, privacy, and billing

| Route | Status | Title | Result |
| --- | ---: | --- | --- |
| `/` | 200 | `Continuity Board — plan consistent comic panels` | PASS |
| `/demo` | 200 | `Demo — Continuity Board` | PASS |
| `/privacy/` | 200 | `Privacy — Continuity Board` | PASS |
| `/terms/` | 200 | `Terms — Continuity Board` | PASS |
| `/404.html` | 200 | `Page not found — Continuity Board` | PASS |
| `/verification-4-missing-page` | **404** | `Page not found — Continuity Board` | PASS — deliberate not-found response with a designed page and home link. |

Root internal links returned 200. Legal contact links are explicit `mailto:` links. Titles, descriptions, canonicals, Open Graph data, Twitter data, favicon, Apple icon, social image, sitemap, and route shells are present. The expected browser network diagnostic for the deliberate 404 is recorded separately and is not a defect.

Live responses include the declared self-only CSP with only the Sociobot API in `connect-src`, restrictive permissions policy, HSTS, frame denial, `nosniff`, and strict-origin referrer policy. HTML is `no-cache`, the worker is `no-cache, no-store, must-revalidate`, and hashed assets are immutable for one year.

The rendered Studio link is exactly `https://api.sociobot.in/api/v1/products/comic-reference-sheet-board/checkout`. A read-only request returned 303 to hosted checkout. An invalid verification token returned HTTP 200 with `valid: false` and `reason: invalid`. No payment form is embedded. No real purchase, card entry, or paid request was submitted; valid, cached, revoked, and fallback behavior used the required deterministic fixtures.

This is a static local-first PWA. Product-backend tenant isolation, SQLite restart persistence, health routes, product-server 429 handling, CLI, library, and desktop-package checks do not apply.

## Candidate identity, budgets, and Lighthouse

All 29 deployable `dist/` files, excluding deployment-only `staticwebapp.config.json`, matched the live responses by SHA-256. This includes HTML, JS, CSS, source map, legal pages, worker files, manifest, icons, fonts, and all image variants. Evidence is `/work/.evidence/verify-4/live-hash-comparison.log`.

| Item | Actual | Budget | Result |
| --- | ---: | ---: | --- |
| Initial JS | 35,777 B raw / 10,799 B gzip | 200 KB | PASS |
| CSS | 22,473 B raw / 5,625 B gzip | 50 KB | PASS |
| Fonts | 68,804 B | 120 KB | PASS |
| 480 px AVIF hero | 12,473 B | 300 KB | PASS |

Fresh Lighthouse 13.0.1 results:

| Profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 100 | 100 | 100 | 100 | 0.9 s | 1.5 s | 0 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.2 s | 0.4 s | 0 ms | 0 |

## Earlier finding disposition

| Earlier finding | Current evidence |
| --- | --- |
| Candidate and live output differed | Resolved. All 29 deployable files match `de9fb1d` by SHA-256. |
| Studio could not close with an empty required field | Resolved live. The named dialog closed and returned focus with the field empty. |
| Initial worker control reloaded without consent | Resolved live and in regression. Only one initial navigation occurred. |
| CSP, permissions, cache headers, and manifest MIME were incomplete | Resolved. Live response headers and manifest checks pass. |
| Production checkout returned 404 | Resolved. The product endpoint returns 303 to hosted checkout. |
| A 70-character mobile name overflowed | Resolved live and in regression at 390 px. |
| Brand and legal targets were under 44 px | Resolved. Measured values are at least 44 × 44 px. |
| Hero lacked responsive formats | Resolved live. AVIF, WebP, JPEG, `srcset`, `sizes`, dimensions, and async decoding are present. |
| One-click sample and isolation were absent | Resolved live. Complete data, label, reset, start-real, and unchanged real storage all passed. |
| Claims register and tagged tests were absent | Resolved. Seventeen entries, seventeen unique tags, and all seventeen commands passed. |
| First-screen and landing structure were incomplete | Resolved on desktop and phone before scrolling. The copy audit has no flagged sentence. |
| Dialogs had no accessible names | Resolved. All five named-dialog regressions pass; project, panel, and Studio were also checked live. |
| Storage recovery was blocked by CSP | Resolved live. The module-bound action reloaded without an unexpected console error. |
| A real 404 was missing | Resolved. An unknown path returns HTTP 404 with the designed page and return link. |
| Metadata and the shared legal shell were incomplete | Resolved. Route titles, metadata, headers, footer, sitemap, and social assets pass. |
| Worker update behavior was untested | Resolved by the required controlled fixture, which proves notice, consent, activation, and cache version. |
| Valid paid return behavior was untested | Resolved by the required deterministic Sociobot response fixture. No real purchase was made. |

## Evidence and final classification

- Browser results: `/work/.evidence/verify-4/live-qa-results.json`
- Desktop and phone screenshots: `/work/.evidence/verify-4/`
- Aggregate tests: `/work/.evidence/verify-4/npm-test.log`
- Individual claims: `/work/.evidence/verify-4/claim-commands.log`
- Artifact comparison: `/work/.evidence/verify-4/live-hash-comparison.log`
- Factory URL check: `/work/.evidence/verify-4/verify-url/verify.json`
- Lighthouse: `/work/.evidence/verify-4/lighthouse-mobile.json` and `/work/.evidence/verify-4/lighthouse-desktop.json`

**Final classification: PASS with zero findings and zero untested claims.**
