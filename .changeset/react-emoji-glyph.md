---
'@refraction-ui/react': minor
---

Add `EmojiGlyph` to `@refraction-ui/react` (#575): `<EmojiGlyph emoji="👍" size={20} animate />` draws the animated Noto art where the library ships one, otherwise the Twemoji still, otherwise the native glyph — the same props, art keys and manifest as Flutter's `RefractionEmojiGlyph`. Animation (lottie-web plus one Lottie file) loads on first use only, from `animatedBaseUrl` (a pinned jsDelivr mirror of the Flutter assets by default); `animate={false}` and `prefers-reduced-motion` always show the still. Also exports `emojiGlyphKey`, `resolveEmojiGlyphSources` and an injectable `loadAnimation` seam.
