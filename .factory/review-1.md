# Review 1: Plan character and panel continuity

## Verdict

**FAIL**

- Findings: **7** — 0 critical, 2 high, 5 medium, 0 low.
- Untested public claims: **2**.
- Live URL: <https://comic-reference-sheet-board.sociobot.in>
- Implementation reviewed: `5a61fa5d15402549b1722cba9f525d2e4f2c784e`
- Documentation baseline reviewed: `6b20a694c78238874369033bb695e027232bc24a`
- Review date: 2026-09-05

The live site matches the implementation, and the main four-panel workflow works. It does not meet the current factory contract because the sample sandbox and claims register are absent. Five other product and site defects remain.

## First screen before scrolling

- Job: plan character, prop, and shot continuity before drawing.
- Audience: tabletop groups and hobby comic makers making short stories.
- First available action: **Start a four-panel board**.

The actual screen does not state the audience. Its h1 is only **Continuity Board**. The job appears in the h2 **Keep the coat, key, and camera angle straight.** There is no **Try it with sample data** action.

Fresh 1440 × 900 desktop and 390 × 844 phone contexts had no console or page errors, no cross-origin load requests, no horizontal overflow, and no serious or critical axe findings. Screenshots are in `/work/.evidence/desktop-first-screen.png` and `/work/.evidence/phone-first-screen.png`.

## Findings

### F1 — High — The required sample sandbox is absent

The first screen has no one-click sample action. `GET /demo` returns the ordinary empty app with the ordinary page title. It has no populated example, persistent **Demo — sample data, nothing is saved** label, **Reset demo**, or **Start for real** action. `.factory/demo.md` is also absent.

This is not only a missing label. In an isolated browser context, a project created at `/demo` was stored in IndexedDB database `continuity-board`, store `boards`, key `workspace`. The same project then appeared at `/`. The route therefore writes to the normal workspace instead of a separate `demo:` namespace.

Provide a realistic one-click sample, isolated storage, the persistent label and controls, direct `/demo` entry, and the required demo documentation. The sample must be available offline and must not read or write the normal workspace.

### F2 — High — Public claims have no required register or tagged tests

`.factory/claims.json` is absent and `rg '@claim:'` finds no tagged tests. There were no declared claim commands to run. The site, legal pages, and README make 20 distinct claim groups about projects, four-panel setup, references, attributes, credits, props, panel links and ordering, 4–12 panels, JSON import/export, print/PDF, attribution, offline use, installation, updates, pricing, duplication, 390 px layout, keyboard use, reduced motion, local storage, and account/analytics/license behavior. None is connected to the required sandbox command.

Most behavior was confirmed incidentally by the general suite or this review, but that does not provide the required claim-to-test traceability. Two public claims remain untested end to end: a real worker-version transition showing and applying the update notice, and a completed paid checkout returning a valid production license and unlocking Studio. The untested claim count is therefore 2.

Add one entry per public claim to `.factory/claims.json`, with exactly one observable `@claim:<id>` test for each. Use fixtures for paid verification without spending, and a controlled old-worker fixture for the update path.

### F3 — Medium — The first screen and landing page do not follow the required content structure

The h1 names the product instead of the job. The supporting sentence does not name tabletop groups or hobby comic makers. The primary action has no adjacent explanation of what happens next. The screen does not show three short privacy, offline, and price facts. On the phone, the price control is hidden.

The page also lacks the required three-step **How it works** section, a clear **What it does not do / privacy** section, and a visible paid-tier section. The header has no site navigation. The footer lacks **Built by Param Factory** and a version or build id. `.factory/copy-audit.md` is absent. Copy such as **Continuity before the first line**, **Give the story a visual anchor**, **Let the short story breathe**, and the offline page's press wording also conflicts with the plain-words rule.

### F4 — Medium — All five dialogs have no accessible name

The project, reference, prop, shot, and Studio `<dialog>` elements have headings but no `aria-labelledby` or `aria-label`. Playwright's accessibility snapshot exposed `dialog` with no name, and `getByRole('dialog', { name: 'New project' })` and the equivalent Studio query both returned zero. Keyboard focus enters each dialog and returns correctly, but screen-reader users do not hear a dialog name.

### F5 — Medium — The storage-error recovery button is blocked by CSP

When IndexedDB is unavailable, the app shows **Local storage is unavailable** and a **Reload** button. That button uses an inline `onclick`. The live CSP permits only self-hosted scripts, so clicking it causes a CSP console error and no navigation. The measured main-frame navigation count stayed at 1 before and after the click.

Bind this action in the module code, as the app does for its other buttons, and add a browser test that forces storage startup failure and proves recovery.

### F6 — Medium — The required 404 route is missing

`/this-route-must-not-exist-review-1` and `/404.html` both return HTTP 200 with the normal empty app. There is no designed not-found page or link explaining how to return. This is not an expected deliberate HTTP 404; it is a missing required route caused by the catch-all rewrite.

### F7 — Medium — Route metadata and the shared site shell are incomplete

The root has no canonical link, Open Graph metadata, Twitter card metadata, or Apple touch link. `/demo` keeps the root title instead of **Demo — Continuity Board**. The sitemap lists only `/`, `/privacy/`, and `/terms/`. Privacy and terms have correct route titles, one h1, and one main landmark, but they do not use the required shared header and footer. The app footer also omits the factory credit and build id.

## Working paths and evidence

### Clean checkout commands

Run in a detached clean worktree at the implementation SHA:

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 52 packages, 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run build` | PASS — TypeScript and Vite; `dist/` produced |
| `npm test` | PASS — Vitest 4/4 and Playwright 18/18 |

There is no lint script. There is no claims file, so there are no declared claim commands.

### Live product flow

In fresh disposable browser contexts, without touching saved user data:

- Empty project-name validation stayed in the dialog and allowed correction.
- A realistic board named **The Brass Key review** was created with one credited image reference, two locked attributes, one checked prop, and four completed shots.
- All four shots linked the reference and prop. Coverage reached **4 of 4 shots linked**.
- Reload retained the board in IndexedDB.
- A GIF and a 4,000,001-byte PNG were rejected with clear recovery text. A valid PNG then saved.
- JSON export contained one project, one credited reference, four panels, and a reference link on every panel. Malformed import was rejected, and the valid backup then imported.
- Print media retained the supplied credit and hid editing controls.
- Canceling project deletion kept the project.
- A fixture-cached Studio state allowed panels through 12 and project duplication. This did not test a real purchased license.
- Two free local projects could be created, switched, and retained after reload.

The populated screenshot is `/work/.evidence/desktop-populated-board.png`.

### Mobile, keyboard, and accessibility

- At 390 × 844, a valid 70-character unbroken name fit the document and heading.
- Brand, Privacy, and Terms targets measured at least 44 × 44 CSS pixels.
- First Tab focused the skip link with a visible 3 px outline. Enter focused main. Dialog open, Escape, and focus return passed.
- Reduced-motion transition duration was `0.00001s`.
- The empty and populated screens had zero serious or critical axe findings.
- A 320 px reflow check had no horizontal overflow.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, one h1, one main, alt text, labeled buttons, and no console errors.

The unnamed-dialog defect is not detected by the automated axe scan and remains valid.

### Offline, privacy, billing, and links

- A fresh phone context installed worker cache `continuity-v9-shell`, reloaded the saved board offline, accepted an offline prop change, and retained it after another offline reload.
- Normal browsing and the full free workflow made no cross-origin requests. An explicit invalid-license restore contacted only `https://api.sociobot.in` and showed the correct rejection.
- Checkout returns HTTP 303 to the hosted checkout. The invalid verify request returns HTTP 200 with `valid: false` and `reason: invalid`.
- A 40-request verify burst returned 29 HTTP 200 and 11 HTTP 429 responses. Every 429 had `Retry-After: 4`.
- Root, privacy, terms, manifest, worker, robots, sitemap, and local assets return 200. Internal links work; the checkout link returns the expected 303. The missing 404 behavior is F6.
- This is a static PWA with no product backend, tenant store, server restart persistence, health route, CLI, library, or desktop package. Those checks do not apply. Browser state uses IndexedDB as allowed by the local-first brief.

### Candidate identity and budgets

All 25 deployable files from a clean build of `5a61fa5` match the live response by SHA-256. `staticwebapp.config.json` is deployment configuration and was excluded from byte comparison. Representative hashes:

| File | SHA-256 |
| --- | --- |
| `/` | `28b6864e9ee7f3f29ee1594a98b9d2fc5f047eb0d8bcb8a1e1ad59347baab823` |
| JS | `6e3f523754c39a78990ca3e2a72d3f182225a1ab579ef5a3f44b072d9c14e23d` |
| CSS | `1551f2dcfab5fa7c3d2435c40d2f8adb96ba28d633982c8c55a8eaa46bcecceb` |
| `/sw.js` | `0573a23a0f8081b9e1e78092598d7dd1fd8058993bee87cf1b2d9d66cda3ec02` |

Initial JS is 29,072 bytes raw and 8.98 KB gzip. CSS is 19,007 bytes raw and 4.93 KB gzip. Fonts total 68,804 bytes. The 480 px AVIF hero is 12,473 bytes. All declared budgets pass.

A fresh Lighthouse 13.0.1 mobile run scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO. FCP was 1.1 s, LCP 1.7 s, TBT 10 ms, and CLS 0. Report: `/work/.evidence/lighthouse-review-1.json`.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Live/candidate mismatch | Resolved. All 25 public files match implementation `5a61fa5`. |
| Studio close control blocked by required input | Resolved. It closes with an empty field and restores focus. |
| Unprompted reload on first service-worker control | Resolved. One initial main-frame navigation was observed. |
| Missing CSP, permissions policy, cache policy, and manifest MIME | Resolved on live responses. |
| Production checkout returned 404 | Resolved. It now returns 303 to hosted checkout. |
| 70-character mobile name overflow | Resolved at 390 px. |
| Footer and brand targets below 44 px | Resolved; measured targets meet 44 px. |
| Hero lacked responsive formats | Resolved with AVIF, WebP, and JPEG source sets. |
| Real service-worker version update | Still untested on the current candidate; counted above. |
| Completed paid return with a valid license | Still untested; counted above. |

## Required next steps

1. Build the isolated one-click sample and document it.
2. Add the claims register and tagged sandbox tests, including controlled update and valid-license fixtures.
3. Replace the first screen and landing information structure with the required plain wording and sections.
4. Name every dialog and repair the CSP-blocked storage recovery action.
5. Add a real 404, route-specific metadata, full social metadata, and the shared site shell.
6. Repeat this review from a clean checkout and live fresh browser contexts.
