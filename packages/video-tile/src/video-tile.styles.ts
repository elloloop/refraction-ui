import { cva } from '@refraction-ui/shared'

/**
 * Root tile container — rounded corners, clipped media.
 *
 * - `fill: 'false'` (default) — keeps a 16:9 aspect ratio, for grids that size
 *   tiles by width.
 * - `fill: 'true'` — fills its parent, for a spotlight or stage cell whose
 *   height is set by the layout; a 16:9 box there would overflow and clip the
 *   name chip.
 *
 * State highlights live on the inset edge overlay (`videoTileEdgeVariants`),
 * not on the root: an outer ring is cut off by any scrolling or clipping
 * parent (filmstrips, stages) and sits under full-bleed video.
 */
export const videoTileVariants = cva({
  base: 'relative overflow-hidden rounded-lg bg-muted',
  variants: {
    fill: {
      true: 'h-full w-full',
      false: 'aspect-video',
    },
  },
  defaultVariants: {
    fill: 'false',
  },
})

/**
 * Media layer. Direct children (a `<video>`, `<canvas>` or image) fill the
 * tile; camera video is cropped to cover, a shared screen is letterboxed so no
 * part of it is cut off.
 */
export const videoTileMediaVariants = cva({
  base: 'absolute inset-0 h-full w-full [&>*]:h-full [&>*]:w-full',
  variants: {
    fit: {
      cover: '[&>video]:object-cover [&>img]:object-cover',
      contain: '[&>video]:object-contain [&>img]:object-contain',
    },
  },
  defaultVariants: {
    fit: 'cover',
  },
})

/**
 * Inset edge drawn above the media, so the highlight stays visible over video
 * and inside clipping parents. Colour is never the only cue: speaking also
 * shows the sound-wave icon and pinned shows the pin badge.
 */
export const videoTileEdgeVariants = cva({
  base: 'pointer-events-none absolute inset-0 z-10 rounded-[inherit] border-2 transition-colors duration-200 motion-reduce:transition-none',
  variants: {
    emphasis: {
      speaking: 'border-success',
      pinned: 'border-primary',
      none: 'border-transparent',
    },
  },
  defaultVariants: {
    emphasis: 'none',
  },
})

/**
 * Name chip anchored to the bottom-left of the tile.
 * Semi-transparent bg keeps it legible over any media content.
 */
export const videoTileNameChipClass =
  'absolute bottom-2 left-2 z-20 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-md bg-background/70 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm'

/**
 * Participant name inside the chip — truncates instead of overflowing the
 * tile. On a shared screen it carries the qualifier too ("Ada (Presenting)"),
 * so a narrow tile cuts the qualifier before the name.
 */
export const videoTileNameClass = 'min-w-0 truncate'

/** Shared-screen icon before the name on a shared-screen tile. */
export const videoTileScreenShareLabelClass = 'shrink-0 text-muted-foreground'

/**
 * Mic-muted icon container — sits inside the name chip at the trailing edge.
 */
export const videoTileMicIconClass = 'shrink-0 text-destructive'

/** Active-speaker sound-wave icon inside the name chip. */
export const videoTileSpeakingIconClass = 'shrink-0 text-success'

/**
 * Avatar fallback area, shown when no media stream is available. It stops
 * above the name chip's band (bottom 2rem), so the circle centred in it never
 * runs under the chip, however short the tile.
 */
export const videoTileAvatarFallbackClass =
  'absolute inset-x-0 top-0 bottom-8 flex items-center justify-center p-1'

/**
 * Avatar circle (initials or image) — fills the fallback area's height up to
 * 4rem, so it shrinks with a small filmstrip tile.
 */
export const videoTileAvatarCircleClass =
  'flex aspect-square h-full max-h-16 items-center justify-center rounded-full bg-card text-foreground font-semibold select-none object-cover'

/**
 * Initials inside the avatar circle — an SVG drawn to the circle's size, so the
 * letters scale with it instead of overflowing a small tile.
 */
export const videoTileInitialsClass = 'h-full w-full'

/**
 * Geometry of the initials SVG: a 40-unit square with the letters centred at
 * about a third of its height (20px in a 4rem circle).
 */
export const videoTileInitialsSvg = {
  viewBox: '0 0 40 40',
  x: 20,
  y: 20,
  fontSize: 13,
} as const

/** Top-left cluster — the raised-hand badge. */
export const videoTileTopStartClass = 'absolute left-2 top-2 z-20 flex items-center gap-1'

/** Top-right cluster — reaction, pin badge and the tile menu, in that order. */
export const videoTileTopEndClass = 'absolute right-2 top-2 z-20 flex items-center gap-1'

/** Round status badge (raised hand, pinned). */
export const videoTileBadgeVariants = cva({
  base: 'flex size-7 items-center justify-center rounded-full border backdrop-blur-sm',
  variants: {
    tone: {
      hand: 'border-warning bg-background/80 text-warning',
      pinned: 'border-primary bg-background/80 text-primary',
    },
  },
  defaultVariants: {
    tone: 'pinned',
  },
})

/**
 * Reaction badge — first item of the top-right cluster.
 */
export const videoTileReactionBadgeClass =
  'flex items-center justify-center rounded-full bg-background/70 px-1.5 py-0.5 text-sm backdrop-blur-sm'
