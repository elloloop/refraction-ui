# Interactive Astro Unicode artwork

`RefractionInteractiveComposer` keeps the existing shared composer core and real
textarea. Supported complete Unicode is painted in a sibling mirror; native
text stays selectable, copyable, pasteable and undoable. Composition returns
the whole field to native rendering. Failed assets paint native glyphs in the
mirror. Set `emojiArtwork={false}` for native-only display or `twemojiBaseUrl`
to self-host Twemoji. This is static artwork, not bundled Noto animation.

The original image paste handoff and attachment callbacks are retained. Unicode
rendering changes neither original File bytes nor the host's upload lifecycle.
Browser tests exercise Chromium/WebKit caret, deletion, undo/redo, synthetic
composition, scroll alignment and failure fallback; Chromium additionally
checks real clipboard copy/paste. Physical OS IME is not claimed verified.

Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
CC-BY 4.0: retain attribution and the graphics license when self-hosting:
https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS
