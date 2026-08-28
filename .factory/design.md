# Continuity Board — visual thesis

## Direction and rationale

**Risograph tactile collage** turns continuity planning into a maker's desk rather than another infinite whiteboard. The board uses misregistered ink edges, paper grain, tape tabs, crop marks, and numbered proof stamps to evoke the physical reference packets used before a comic page is drawn. Decoration carries meaning: cyan identifies references, tomato marks panels and current work, and yellow signals props/checks. The app is intentionally light-mode only; a warm paper field is essential to the print-proof metaphor and is painted explicitly.

The compact opening illustration is a sample planning artifact, not simulated product output: three invented silhouettes, a prop key, and four thumbnail frames arranged as a printmaker's proof. The working board remains the visual hero once a project exists.

## Tokens

- Paper/background `#f3ecd8`; paper surface `#fffaf0`; deep ink/text `#25201d`; muted ink `#625a52`.
- Cyan ink `#006f78` and pale cyan `#c5e3df` for references. Tomato ink `#b53225` and pale tomato `#f2c7b6` for panels. Mustard `#9a6500` and pale mustard `#f0dc82` for props and attention. Success `#2d6a43`; danger `#9b2c27`.
- All normal text combinations meet 4.5:1. Focus is a 3 px deep-ink ring with a 2 px paper offset.
- 4/8 px rhythm: 4, 8, 12, 16, 24, 32, 48, 64. Borders are 2 px and shadows are hard 4 px offsets, like stacked stock.

## Type

- Display: self-hosted **Bitter** variable serif, used for the single h1 and section headings; its sturdy slabs resemble hand-set proof type.
- Utility/body: self-hosted **Atkinson Hyperlegible**, used at 16 px minimum for readable form-heavy work. Tabular numerals appear on panel numbers and counts.
- Type scale: 16, 18, 22, 28, clamp(32–48). Long copy is capped at 68 characters.

## Layout and interaction grammar

Desktop is a three-part worktable: an always-visible masthead, a project rail, and a main sheet whose sections follow the actual continuity flow—references, prop ledger, then 4–12 shots. Mobile drops the rail into a project switcher and stacks every editing surface; primary controls remain at least 44 px. Cards are used only for independent reference and shot artifacts. Torn tape tabs label state; checked props receive a physical strike-through. Every change saves locally and reports through a restrained live-status line.

Clicking a card opens an anchored editing dialog; it returns focus to its origin. Additions arrive with a 180 ms lift-and-settle. Toasts slide from the edge for 220 ms. Print strips away the desk and controls, leaving attribution-bearing reference cards, prop states, and ordered panels. Under `prefers-reduced-motion`, transitions are replaced with immediate opacity changes and no animated transforms.

## Asset plan and provenance

- Opening illustration: generated locally for this product, then cropped and optimized to WebP (and PNG source retained under `assets/src/`). Prompt: “Editorial risograph collage on warm recycled paper, overhead view of an original comic planning desk, three entirely invented character silhouette reference cutouts with abstract faces, a small brass key prop, four blank storyboard thumbnail frames linked by red pencil registration marks, limited inks deep teal tomato red mustard yellow charcoal, visible halftone dots and imperfect ink registration, tactile torn paper and masking tape, no readable text, no letters, no watermark, no logos, no copyrighted characters, no realistic people, flat printmaking, clean composition, landscape 3:2.” Negative list: brands, famous characters, legible lettering, UI screenshot, gradients, glossy 3D, photorealistic people, extra fingers, watermark.
- Model: Azure OpenAI image deployment `factory-image`; generation date 2026-08-28. Generated imagery is original to Continuity Board and is disclosed in the footer.
- Icons and texture: hand-authored CSS/SVG geometric marks; no copied icon pack. Paper grain is CSS only. App icons are hand-authored SVG-derived artwork using the ink palette.

## Paid treatment

The free experience supports a genuinely useful board with four panels, reference linking, JSON ownership, and print/PDF. A quiet “Studio unlock” sheet offers a one-time purchase for 5–12 panels and duplicate-project convenience. Buying never blocks accessibility, core export, or existing local data.
