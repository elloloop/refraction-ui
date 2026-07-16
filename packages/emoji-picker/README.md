# @refraction-ui/emoji-picker

Headless emoji core for Refraction UI and the **single source of truth** for the
whole library's emoji: the full modern base set (~1,900 emoji, Unicode 16.0)
with names, keywords, categories, and `:shortcode:` resolution. Consumed by the
React/Astro pickers, the composer's `:` trigger (`createEmojiTrigger`), and
rich-editor's `EMOJI_MAP` — so those never diverge. Private; ships embedded in
the framework metas.

## Dataset

`emoji-dataset.generated.ts` is generated **offline** (no network at build or
runtime) from the canonical Unicode UTS #51 data checked in at
`scripts/emoji/emoji-test-16.0.txt`. Regenerate with:

```bash
node scripts/generate-emoji-data.mjs
```

The set is base-only: skin-tone modifier variants are excluded (skin tone is a
render concern, not a separate entry).

## Rendering seams

- **Emoji** — `twemojiFilename` / `twemojiAssetUrl` map a glyph to a uniform
  Twemoji SVG. The React/Astro adapters expose an `emojiRenderer` seam whose
  default uses these; consumers can swap to native or another set. Twemoji is
  CC-BY 4.0 — see `packages/react-emoji-picker/NOTICE`.
- **Stickers** — `StickerItem` / `StickerSet` + `STARTER_STICKER_SET` model a
  host-extensible sticker tab (`svg` / `image` / `lottie` render paths).

Data source: Unicode® UTS #51 (https://www.unicode.org/terms_of_use.html).
