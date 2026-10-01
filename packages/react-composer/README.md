# Unicode composer rendering

The React composer paints complete supported Unicode graphemes in its existing
height/scroll mirror. The real textarea retains canonical Unicode, caret,
selection, clipboard and browser undo; its caret stays visible. IME composition
returns the complete field to native rendering until composition ends. Committed
mention/token labels keep their own native text. Set `emojiArtwork={false}` to
use native text throughout, or `twemojiBaseUrl` to self-host Twemoji SVGs.

Astro exports a read-only `RefractionComposer` shell. Its optional `value` renders
canonical Unicode with the same artwork and load/error fallback. Slotted content
wins over `value`. Interactive editing requires a React island. This does not
claim native OS IME or animated Noto coverage from synthetic/browser tests.

Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
CC-BY 4.0: retain attribution and the graphics license when self-hosting:
https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS
