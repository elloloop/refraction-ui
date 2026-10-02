---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Enhance sanitized markdown and conversation display text with complete Unicode artwork while preserving canonical selectable text, links, literal code, and editing nodes.

Use linear heading/list/rule block scans to eliminate polynomial whitespace matching exposed by message input.

Artwork is opt-in for private drafts and messages. Configure `twemojiBaseUrl`
with a same-origin SVG directory such as `/emoji`. Explicit artwork without a
custom URL requests emoji-codepoint assets from jsDelivr and exposes the user IP
to that CDN. Configure CSP `img-src` for the chosen origin. Twemoji graphics are
CC-BY 4.0: retain attribution and the graphics license when self-hosting:
https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS
