# Demo sandbox

Open <https://comic-reference-sheet-board.sociobot.in/demo> or `/demo` locally. One click from the landing page opens the same route.

The sample project, **The Lantern Exchange**, contains two original appearance references, three props, and four fully linked panel cards. It includes realistic framing, action, continuity, and source-credit text.

The demo exists only in page memory. It does not open the `continuity-board` IndexedDB database or read license localStorage. Demo edits last until navigation or reload. **Reset demo** restores the bundled sample. **Start for real** leaves the sample and opens the normal IndexedDB workspace without copying sample content.

The service worker caches `/demo`, so the bundled sample opens after the first connected visit while offline.
