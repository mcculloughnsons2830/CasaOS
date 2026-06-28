# MsFitZ Society — AstroCode-style landing page replica

A faithful structural replica of the [astrocodice.com](https://astrocodice.com/)
("AstroCode AI") marketing landing page, **rebranded to the MsFitZ Society brand**.

The original's layout, sections and astrology-product copy are reproduced, but the
visual identity is swapped from AstroCode's pink/purple cosmic theme to MsFitZ
Society's **fire-and-ice on black** palette:

- **Near-black** cosmic background with a twinkling starfield
- **Ice / steel blue** primary accent (the brand's lettering color)
- **Ember orange / amber** glow (the bear mascot's glowing eyes & the brand nebula)
- Condensed bold **Oswald** display type with **Inter** body and **Crimson Pro** accents
- A bear-with-glowing-eyes logo motif rendered in pure SVG (no copyrighted asset used)

## Stack

Same stack as the original: **Vite + React + TypeScript + Tailwind CSS**.

## Run it

```bash
cd astrocodice-replica
npm install
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## Features

- Fully responsive single-page landing site
- **EN / IT / ES** language switcher (matching the original's multilingual support)
- Sections: Hero with animated zodiac wheel, accuracy stats, precision pillars,
  feature grid, "how it works" steps, brand/mission statement, membership pricing,
  FAQ accordion, download CTA, footer
- Cosmic background with animated ember/ice nebula glows and twinkling stars

## Structure

```
src/
  App.tsx              # page assembly
  i18n.tsx             # EN/IT/ES dictionaries + context
  index.css            # Tailwind layers + brand component classes
  components/
    Starfield.tsx      # cosmic background
    Logo.tsx           # bear-eye SVG wordmark
    Header.tsx         # sticky nav + language switcher
    Hero.tsx           # headline + animated zodiac wheel card
    Stats.tsx Pillars.tsx Features.tsx HowItWorks.tsx
    Why.tsx Pricing.tsx FAQ.tsx DownloadCTA.tsx Footer.tsx
    GooglePlayBadge.tsx
```

## Notes

This is an independent fan/brand recreation for demonstration. It uses no assets,
fonts (beyond Google Fonts), or code from astrocodice.com, and reproduces the brand
mascot only as an original CSS/SVG interpretation. NASA references mirror the
original's public-domain-data disclaimer; no NASA partnership is implied.
