# Astro read-only Unicode composer

`RefractionComposer` is a read-only SSR shell. Set `value` for a canonical Unicode
draft; slotted content takes precedence, and an empty value displays the placeholder.
It uses native Unicode by default. Explicitly set `emojiArtwork={true}` to render
artwork and `twemojiBaseUrl` to your same-origin SVG directory (such as `/emoji`).
It adds no editable textarea or native keyboard behavior.

Explicit artwork without a custom URL uses jsDelivr, exposing emoji codepoints and
user IP to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics
are CC-BY 4.0: retain source attribution and the graphics license when self-hosting:
https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS
