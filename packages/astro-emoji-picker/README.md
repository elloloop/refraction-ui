# Astro Emoji Picker

## Keyboard Unicode display

Import `EmojiText` from the public framework meta and pass `text`. Complete
ZWJ families, flags, and keycaps use the shared Flutter Twemoji inventory.
Unknown graphemes, unsupported skin tones, VS15 text presentation, and engines
without `Intl.Segmenter` stay native; sequences are never partially replaced.
Unicode remains selectable text and image failure returns to native glyphs.
The web default is static Twemoji. Animated Noto is a host renderer seam in
React, not a bundled web player. Astro is SSR display, with a small script for
image load/error fallback; it does not add an interactive editor.

Regenerate the shared inventory after Flutter artwork changes with
`node scripts/generate-emoji-artwork.mjs`; a test detects inventory drift.

Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
CC-BY 4.0: retain attribution and the graphics license when self-hosting:
https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS

`nativeOnly` renders native Unicode in Astro EmojiText and picker SSR and client search.
