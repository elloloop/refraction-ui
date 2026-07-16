---
'@refraction-ui/react': minor
'@refraction-ui/astro': minor
---

Composer: full emoji experience, WhatsApp-style expression panel, and motion polish.

- **Full emoji set** — the composer's `:` trigger and the emoji picker now share one generated Unicode 16.0 dataset (~1,900 emoji) sourced from `@refraction-ui/emoji-picker`; `rich-editor`'s shortcode map is built from the same source (no more divergent hand-lists).
- **Uniform rendering** — default `emojiRenderer` is Twemoji (uniform across platforms; CC-BY 4.0, attribution in NOTICE/README), lazy per-glyph and swappable to native or a self-hosted base URL with one prop.
- **Stickers** — sticker types + a starter set (with one animated example) + a `stickerRenderer` seam (svg/image/lottie); hidden when no sticker sets are supplied.
- **Inline expression panel** — `accessoryPanel` docks host content directly below the field (never a portal/overlay that covers the message you're typing), with an animated toggle.
- **Surface variant** — `surface="outlined" | "filled"`; filled uses a muted fill + hairline and keeps a tasteful focus ring.
- **Motion** — attachment chips animate in/out, the `@`/`:` menus and send⇄stop swap animate, all reduced-motion and SSR safe.
