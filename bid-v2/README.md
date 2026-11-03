# BID website v2 (from 2026-11-02-BID-website-changes.xlsx)

Standalone rebuild of the Benefit Intelligence & Design page. It is separate from
`../index.html`, `../index-animated.html` and the Next.js site, and nothing outside
this folder was changed.

```
bid-v2/
  index.html        page markup, in the 11-block order from the "Page order" sheet
  css/style.css     brand tokens and components (healthchain.com palette, type, pill buttons)
  js/main.js        navigation, scroll reveals, chart sequence, ledger and records drawer
  assets/           logo.png, pattern8.png (hero), pattern7.png (closing), copied from ../assets
```

No build step and no dependencies. Fonts come from Google Fonts. Without a connection, the page falls back to system fonts.

## Preview

- **Quickest:** double-click `index.html`, or open `file:///D:/HC/bid/bid-v2/index.html` in a browser.
- **Local server** (closer to production):
  `cd D:\HC\bid\bid-v2` then `npx serve .` (or `python -m http.server 8080`), and open the URL it prints.
- To compare: open `../index-animated.html` (the reviewed page) in another tab.
- To check responsiveness: browser dev tools, device toolbar, at 390, 768, 1024 and 1440 px.

## Publishing the proof block

The Proof section (`<section id="proof" hidden>`) is in the page but hidden on purpose.
Summary B9, Visuals "Proof" and Cut both say: show no number until a verified pilot
result is approved. To publish it, fill period, volume, share matched and what the rest
was, then remove the `hidden` attribute.

## Sample content to replace when real material exists

- **Screen crops** in parts 1 and 2 (Data loads, Claim detail) are HTML mock-ups labelled "sample". Visuals asks for real product screen crops.
- **Drawer records** (in `js/main.js`, `ENTRIES`) are illustrative. Each set sums exactly to its ledger amount and is labelled "Not customer data".
