# Continuity Board

Continuity Board helps tabletop groups and hobby comic makers keep appearance, props, and panel intent consistent across a short story.

Live product: <https://comic-reference-sheet-board.sociobot.in>

One-click sample: <https://comic-reference-sheet-board.sociobot.in/demo>

## What it does

- A new free board starts with four editable panels.
- A board tracks appearance references, named attributes, props, and per-panel links.
- JSON backup exports and restores a board.
- JSON and print/PDF output include supplied reference credit.
- The browser keeps multiple local projects and restores them after reload.
- The board works offline after the first visit and installs as a standalone PWA.
- An available app update is shown and applied only after confirmation.
- The board supports a 390 px screen, keyboard use, and reduced motion.
- A valid $12 one-time Studio license enables panels 5–12 and project duplication.

The product does not generate images, provide copyrighted templates, publish galleries, or run a collaboration server. Normal board use keeps project data in the browser and sends no cross-origin requests.

## Demo safety

Select **Try it with sample data** or open `/demo`. The sample is populated, resets cleanly, and never changes saved projects. It uses page memory instead of the real IndexedDB workspace. See [`.factory/demo.md`](.factory/demo.md).

## Run and verify

Use Node.js 20.19 or newer. Playwright is pinned to 1.58.2.

```sh
npm ci
npx playwright install chromium # only when the browser is not already installed
npm test
npm run build
npm run preview
```

`npm test` runs unit tests and desktop/mobile browser tests. The build command type-checks the app and writes the static release to `dist/`.

Every public behavior claim and its clean command is registered in [`.factory/claims.json`](.factory/claims.json). The visual system and original asset provenance are in [`.factory/design.md`](.factory/design.md).

## Deploy

Deploy the contents of `dist/` as a static site. Keep `staticwebapp.config.json` with the release so `/demo`, security headers, caching, and the real 404 response work.

The repository does not manage billing, DNS, or other infrastructure. Checkout and license verification use the Sociobot billing API without an embedded secret.

## License

MIT — see [LICENSE](LICENSE).
