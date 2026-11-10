# Gilda, plano de obra

The gilda pintxo treated as a construction project: plan and elevation, an exploded view, a bill of quantities with real prices, an assembly you can build yourself (judged by a site inspector in red pencil), variants, the disputed origin, and where to eat one. Every fact links to its source.

Spanish, English and Basque. The Basque copy is a draft waiting for review by a native speaker, and the site says so.

## How it is built

- **No build step.** Plain HTML, CSS and native ES modules, served as-is by GitHub Pages.
- **Hash routes** (`#/1` to `#/7`, `#/creditos`). Pages serves static files only, so there are no server rewrites to set up, and every sheet is a shareable link. That includes a judged gilda: `#/4?g=o,p,p,p,a,o`.
- **One block library** (`js/pieces.js`). Every piece is drawn once, in millimetres, and inserted by every sheet, the way CAD blocks work. Fix the anchovy there and every drawing gets the fix.
- **All content lives in `js/data.js`**, with its sources. The views contain no facts of their own.
- **One colour per layer** (structure, fish, pickle, olive, other), borrowed from AutoCAD's index colours. The red pencil is reserved for the inspector and for disputed dimensions.
- **Pointer Events** for the assembly, so mouse, pen and touch share one code path. Tapping a piece also adds it, which makes the game usable with a keyboard and without any dragging.
- **No tracking.** No cookies, no analytics, no ads, no third-party requests. The fonts (JetBrains Mono and Architects Daughter, SIL OFL) are served from this repository.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Layout

```
index.html        shell, header, nav, footer
css/site.css      the whole look
js/main.js        language, routing, title block
js/i18n.js        UI strings (es, en, eu)
js/data.js        facts, sources, variants, places
js/pieces.js      SVG block library, dimension lines, north arrow
js/sheets.js      sheets 01, 02, 03, 05, 06, 07 and credits
js/assembly.js    sheet 04: build, inspect, share
fonts/            self-hosted woff2 plus licences
```

Tips welcome at [ko-fi.com/lessane](https://ko-fi.com/lessane).
