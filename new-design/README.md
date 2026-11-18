# Plumbline: new design

A standalone landing page for a Medicare Advantage and Medicaid intelligence product. It reuses the content of `../vlada-homepage/index3.html` with a new layout and visual identity. That project is unchanged.

"Plumbline" is a **working brand name**. To rename it, search and replace `Plumbline` in `index.html` and update `assets/img/logo.svg`.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```
npx serve .            # or
python -m http.server 8080
```

There's no build step and no runtime dependencies. Fonts are self-hosted.

## Structure

```
new-design/
├── index.html            Page markup (all sections)
├── css/
│   ├── base.css          Fonts, design tokens, reset, typography, reveal + reduced-motion rules
│   ├── components.css    Nav, mega menu, mobile sheet, buttons, tags, lookup forms, fields, ask console
│   └── sections.css      Hero, ticker, ask, free tools bento, data, Bid Platform, plans, why, research/contact, footer
├── js/
│   ├── demo-data.js      Console topics and example Q&A (illustrative figures)
│   └── main.js           All interactions (vanilla JS)
├── fonts/                Bricolage Grotesque, Geist, Geist Mono (latin, woff2, SIL OFL)
└── assets/img/           logo.svg, favicon.svg
```

## Front-end only

Nothing here talks to a back end yet:

- **Lookups** (contract ID / county) validate the input and show a demo message.
- **Newsletter and contact forms** validate and show a confirmation, but nothing is sent.
- **Figures** in the hero scorecard, console, RFP timeline and variance chart are illustrative.
