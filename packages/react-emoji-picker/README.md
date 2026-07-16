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
