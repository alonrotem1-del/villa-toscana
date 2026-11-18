# Villa Toscana site: rules for agents

Static Hebrew RTL site, no framework, served by GitHub Pages from `main` (root).
Live: https://alonrotem1-del.github.io/villa-toscana/ (a demo: every page carries `noindex` until it moves to the business domain).

## Source of truth
- `assets/js/data.js` holds every price, size, finish and image. Never type a price or size anywhere else.
- Sizes use the shop's notation: the LAST number is the height in cm (`80/23/40` = length 80, width 23, height 40; `56/56` = diameter or side 56, height 56).
- Prices are before VAT unless a size has `vat: true`.
- `models/*.html` are GENERATED. After any change to data.js, index.html header/footer, or the model template, run:
  `node scripts/build-models.mjs`
  New or changed product photos also need social images:
  `node -e "<see scripts/make-og.py docstring>" | python3 scripts/make-og.py`

## Before every commit
`npm install` (once), then `npm run qa`. It must end with "all checks passed": axe WCAG 2.2 AA, no horizontal overflow, no console errors, no broken images, phone and desktop, light and dark.

## Design rules
- Tokens live in `:root` at the top of `assets/css/site.css`, with dark values in both dark blocks. No literal colours in components.
- Type: Frank Ruhl Libre for display, Assistant for everything else. No italics in Hebrew; emphasise with weight or colour.
- Hebrew typography: real ״ ׳ ־; model codes in `<bdi lang="en">`; dimensions shown with the `.dimv` class (reads right to left, matching the legend "אורך × רוחב × גובה") plus a visually hidden full sentence from `VT.dimLong()`.
- Scale is the signature: every size gets a to-scale silhouette (`VTViz.miniIcon`) and model pages get the true-scale balcony scene (`VTViz.sceneSVG`, 1 SVG unit = 1 cm).
- Real product photos only. AI may clean, cut out or upscale, never redraw a product; any AI-made scene is labelled beside the image.
- Motion: CSS only (view transitions between pages, scroll-driven nudges), always inside `prefers-reduced-motion: no-preference`, and content is never hidden waiting for an animation. No WebGL heroes, no smooth-scroll libraries.
- Accessibility: native elements first (`<dialog>` for the order list, `<button aria-pressed>` chips, native range), 24px+ targets, visible focus, skip link, `scroll-padding` for the sticky header and mobile bar. No accessibility overlay widgets.
- Images: WebP (AVIF for the hero), lazy-load everything except the hero.

## Not done yet (only if the owner buys)
VAT-inclusive consumer prices, accessibility statement, privacy notice, own domain with Cloudflare Pages and 301 redirects from the old URLs, email (MX) move. See the research report for details.
