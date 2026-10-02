# @refraction-ui/react-emoji-picker

React emoji picker for Refraction UI: the full modern emoji set (~1,900 base
emoji, Unicode 16.0) with category tabs, fuzzy search, recents, and a stickers
tab. Ships to consumers via the `@refraction-ui/react` meta.

## Uniform rendering & the `emojiRenderer` seam

Native emoji render differently on every OS. By default this picker renders
**uniform Twemoji SVGs** (lazily loaded, one small file per glyph) so every user
sees the same set. Rendering flows through a single `emojiRenderer` seam
(`(emoji: EmojiEntry) => ReactNode`):

```tsx
import { EmojiPicker, nativeEmojiRenderer } from '@refraction-ui/react-emoji-picker'

<EmojiPicker />                                   // uniform Twemoji (default)
<EmojiPicker emojiRenderer={nativeEmojiRenderer} /> // OS-native glyphs
<EmojiPicker twemojiBaseUrl="/emoji" />           // self-hosted uniform assets
```

Swap in Noto/Fluent/Lottie by providing your own `emojiRenderer` — the data and
the picker are untouched.

## Stickers

The ⭐ tab renders `stickerSets` (defaults to a small bundled starter pack). The
`stickerRenderer` seam supports `svg` (may self-animate via SMIL), `image`
(static or animated WebP), and `lottie` (supply a player). Pass `stickerSets={[]}`
to hide the tab.

## Attribution (Twemoji — CC-BY 4.0)

The default renderer loads **Twemoji** graphics, which are © Twitter and the
Twemoji contributors and licensed under
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). **Applications that
ship the default Twemoji renderer must preserve this attribution** (e.g. in an
About/Licenses screen). See `NOTICE` in this package. To avoid Twemoji entirely,
pass `emojiRenderer={nativeEmojiRenderer}` or your own renderer.

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

## Unicode text privacy

`EmojiText` uses native Unicode by default. Set `emojiArtwork={true}` to opt into
static artwork, and `twemojiBaseUrl` to a same-origin SVG asset directory. Explicit
artwork without a custom base uses jsDelivr (emoji codepoint and IP metadata).
The pre-existing picker retains its `emojiRenderer` seam; use
`nativeEmojiRenderer` for its native-only mode. Twemoji graphics are CC-BY 4.0;
retain attribution and https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS.
