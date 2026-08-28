# Continuity Board

Continuity Board is a private, local-first reference and shot planner for tabletop groups and hobby comic makers. It keeps visual references, named appearance locks, prop state, and panel intent together before drawing begins, then prints an attribution-bearing handoff sheet.

Live: <https://comic-reference-sheet-board.sociobot.in>

## What ships

- Multiple browser-local projects, each starting with a four-panel shot strip
- User-created reference image slots, source/credit fields, and locked attributes
- Prop checklists and per-panel links to references and props
- Reorderable 4–12 shot cards with framing, action, and continuity notes
- JSON backup/import and print/PDF export; both preserve source attribution
- Installable offline PWA with update notification
- Optional $12 one-time Studio license for panels 5–12 and project duplication
- Responsive 390 px layout, full keyboard paths, reduced-motion support, privacy and terms pages

There is no image generation inside the product, no account, no collaboration server, and no analytics. Board data lives in IndexedDB. License state is stored in localStorage and checked with Sociobot at most once per day.

## Run and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test       # Vitest + desktop/mobile Playwright + axe + offline reload
npm run build  # reproducible static output in ./dist
npm run preview
```

Playwright is pinned to 1.58.2. In a fresh environment, install its Chromium binary with `npx playwright install chromium` if one is not already available.

## Deploy

Deploy the contents of `dist/` as a static site with `index.html` at the root. Do not configure billing, DNS, or infrastructure from this repository. The hosted checkout and license verifier use the product slug, so no product ID or secret is embedded in the client.

The researched scope is in [`.factory/brief.json`](.factory/brief.json), the visual and asset provenance record is in [`.factory/design.md`](.factory/design.md), and release verification is in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
