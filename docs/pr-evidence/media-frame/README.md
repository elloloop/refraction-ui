# Media Frame review captures

Docs-site pages at 1440px and 375px wide, in light and dark, rendered by the Next.js dev server with Chromium. `before-*` is the Device Frame page at the parent revision, the library's only frame for media until now: it fixes the box to a device's size and has no free aspect ratio or caption. `after-*` is the new Media Frame page: ratios, fitting media (cover and contain), tone, and the four caption corners. Device Frame is unchanged.

Each capture is the page heading plus its example sections; the artwork is an inline SVG so the captures need no network image. `browser-proof.json` records, for every capture, page overflow and browser errors, and on the Media Frame page what the browser measured: every one of the 11 frames renders at the ratio its `aspect-ratio` asks for, `data-orientation` agrees with the rendered shape, each caption sits in its named corner, the `start`/`end` corners mirror when the document is switched to `dir="rtl"`, and no caption takes pointer events.

The browser error in dark mode is a hydration mismatch in the docs site's own colour-mode toggle; it appears on the parent revision too. The parent revision's Device Frame page also overflows horizontally at 375px; the Media Frame page does not.
