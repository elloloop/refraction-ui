# React Unicode composer artwork

The canonical draft stays in the real textarea, so selection, copy/paste, deletion
and undo operate on Unicode. Artwork is opt-in (`emojiArtwork={true}`); without it,
private drafts create no artwork requests. Set `twemojiBaseUrl` to a same-origin
asset directory such as `/emoji`. IME composition returns the entire field to
native rendering. Failed assets preserve native glyphs in the separate mirror.

Explicit artwork without a custom URL uses jsDelivr and exposes the emoji asset
codepoint and user IP to that CDN. Configure CSP `img-src` for your chosen origin.
Twemoji graphics are CC-BY 4.0; retain source attribution and graphics license:
https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS

The Astro adapter documents its own rendering and event APIs separately.
