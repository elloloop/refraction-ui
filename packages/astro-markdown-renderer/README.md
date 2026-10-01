# Markdown renderer


## Unicode message display

Sanitized HTML is enhanced after hydration using the shared complete-grapheme
artwork inventory. Unicode remains selectable text; code/pre, URL attributes,
and editable nodes are never rewritten. Native text remains during load/error
and when artwork is disabled. React conversation messages consume this renderer;
Astro conversation SSR messages invoke the same helper. Hosts replacing Astro
message DOM can call `enhanceUnicodeEmojiDisplay` after their render. This is
static Twemoji coverage, not a bundled web Noto animation runtime.

Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
CC-BY 4.0: retain attribution and the graphics license when self-hosting:
https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS
