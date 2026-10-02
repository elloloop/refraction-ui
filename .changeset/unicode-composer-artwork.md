---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Paint complete supported Unicode artwork in the React composer mirror while preserving the real textarea and native IME composition. Add a canonical read-only Unicode value to the Astro composer shell.

Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
CC-BY 4.0: retain attribution and the graphics license when self-hosting:
https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS
