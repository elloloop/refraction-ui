/**
 * Sticker seam — types + a small bundled starter pack.
 *
 * Stickers are host-extensible: a consumer (or a future bundled pack) supplies
 * `StickerSet`s and the picker renders them in a dedicated tab. Three render
 * paths are supported so the API is ready for animated content without any
 * heavy dependency in the core:
 *   - `kind: 'svg'`   — inline SVG markup (can self-animate via SMIL, no JS).
 *   - `kind: 'image'` — a URL to a static or animated (WebP/GIF/APNG) asset.
 *   - `kind: 'lottie'`— a URL/JSON handed to a host-provided Lottie player.
 *
 * The starter pack below ships a handful of simple, consistent flat stickers
 * (128×128, one visual language) so the tab is not empty out of the box, and
 * proves the animated render path with a self-animating SMIL heart — no Lottie
 * runtime required.
 */

export type StickerKind = 'svg' | 'image' | 'lottie'

export interface StickerItem {
  /** Stable id (unique within its set). */
  id: string
  /** Accessible label / alt text. */
  label: string
  kind: StickerKind
  /**
   * The sticker payload: inline SVG markup (`svg`), an asset URL (`image`), or
   * a Lottie JSON URL or serialized object (`lottie`).
   */
  source: string
  /** Search keywords. */
  keywords?: string[]
  /** True when the sticker animates (drives reduced-motion handling). */
  animated?: boolean
}

export interface StickerSet {
  /** Stable id (unique across sets). */
  id: string
  /** Human-readable set name (tab tooltip). */
  label: string
  /** A representative emoji/char for the set's tab icon. */
  icon?: string
  stickers: StickerItem[]
}

const svg = (inner: string): string =>
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${inner}</svg>`

/**
 * Refraction starter sticker pack — a tasteful, consistent flat set. The
 * `pulse-heart` sticker self-animates via SMIL to demonstrate the animated
 * render path; the rest are static.
 */
export const STARTER_STICKER_SET: StickerSet = {
  id: 'refraction-starter',
  label: 'Refraction',
  icon: '⭐',
  stickers: [
    {
      id: 'pulse-heart',
      label: 'Pulsing heart',
      kind: 'svg',
      animated: true,
      keywords: ['heart', 'love', 'like'],
      source: svg(
        `<g fill="#ff5a7a"><path d="M64 112C34 90 16 72 16 50a26 26 0 0 1 48-14 26 26 0 0 1 48 14c0 22-18 40-48 62Z">` +
          `<animateTransform attributeName="transform" type="scale" additive="sum" values="1;1.08;1" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" keyTimes="0;0.5;1"/>` +
          `</path></g>`,
      ),
    },
    {
      id: 'star',
      label: 'Gold star',
      kind: 'svg',
      keywords: ['star', 'favorite', 'award'],
      source: svg(
        `<path fill="#ffc93c" d="M64 14l14 30 33 4-24 23 6 33-29-16-29 16 6-33-24-23 33-4z"/>`,
      ),
    },
    {
      id: 'thumbs-up',
      label: 'Thumbs up',
      kind: 'svg',
      keywords: ['thumbsup', 'like', 'yes', 'approve'],
      source: svg(
        `<g fill="#4c9aff"><rect x="20" y="56" width="20" height="50" rx="5"/>` +
          `<path d="M48 56l16-34c9 0 14 7 12 18l-3 14h26c8 0 13 8 10 16l-9 26c-2 6-8 10-14 10H48Z"/></g>`,
      ),
    },
    {
      id: 'party',
      label: 'Party popper',
      kind: 'svg',
      keywords: ['party', 'celebrate', 'tada', 'confetti'],
      source: svg(
        `<path fill="#ff8a3d" d="M18 110L52 44l32 32z"/>` +
          `<circle cx="92" cy="30" r="6" fill="#ff5a7a"/><circle cx="110" cy="52" r="5" fill="#ffc93c"/>` +
          `<circle cx="70" cy="20" r="5" fill="#4c9aff"/><circle cx="104" cy="82" r="6" fill="#5ad19a"/>`,
      ),
    },
    {
      id: 'smiley',
      label: 'Smiley blob',
      kind: 'svg',
      keywords: ['happy', 'smile', 'face'],
      source: svg(
        `<circle cx="64" cy="64" r="46" fill="#ffd23f"/>` +
          `<circle cx="48" cy="56" r="6" fill="#3a2d00"/><circle cx="80" cy="56" r="6" fill="#3a2d00"/>` +
          `<path d="M44 78a24 24 0 0 0 40 0" stroke="#3a2d00" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      ),
    },
    {
      id: 'fire',
      label: 'Fire',
      kind: 'svg',
      keywords: ['fire', 'hot', 'lit'],
      source: svg(
        `<path fill="#ff6b35" d="M64 12c8 22-14 26-14 46a14 14 0 0 0 28 0c0-6-2-10-2-14 10 6 16 18 16 30a28 28 0 0 1-56 0c0-30 20-40 28-62Z"/>` +
          `<path fill="#ffd23f" d="M64 62c4 8-6 10-6 20a10 10 0 0 0 20 0c0-8-8-12-14-20Z"/>`,
      ),
    },
    {
      id: 'check',
      label: 'Check',
      kind: 'svg',
      keywords: ['check', 'done', 'ok', 'yes'],
      source: svg(
        `<circle cx="64" cy="64" r="46" fill="#5ad19a"/>` +
          `<path d="M42 66l14 14 30-32" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      ),
    },
    {
      id: 'heart-eyes',
      label: 'Love it',
      kind: 'svg',
      keywords: ['love', 'heart', 'adore'],
      source: svg(
        `<circle cx="64" cy="64" r="46" fill="#ffd23f"/>` +
          `<path fill="#ff5a7a" d="M40 50c5-6 13-2 13 4 0 5-6 9-13 14-7-5-13-9-13-14 0-6 8-10 13-4Z"/>` +
          `<path fill="#ff5a7a" d="M88 50c5-6 13-2 13 4 0 5-6 9-13 14-7-5-13-9-13-14 0-6 8-10 13-4Z"/>` +
          `<path d="M44 84a24 24 0 0 0 40 0" stroke="#3a2d00" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      ),
    },
  ],
}
