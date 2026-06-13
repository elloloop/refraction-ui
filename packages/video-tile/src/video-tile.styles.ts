import { cva } from '@refraction-ui/shared'

/**
 * Root tile container — aspect-video, rounded corners, clipped media.
 *
 * `speaking` variant adds a visible ring to indicate active audio.
 * `pinned` variant adds a stronger ring to mark a pinned participant.
 *
 * cva boolean-like variants use string values ('true'/'false') per the
 * refraction-ui convention — callers must pass strings, not raw booleans.
 */
export const videoTileVariants = cva({
  base: [
    'relative aspect-video overflow-hidden rounded-lg bg-muted',
    'transition-shadow duration-200',
  ].join(' '),
  variants: {
    speaking: {
      'true': 'ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-2 ring-offset-background',
      'false': '',
    },
    pinned: {
      'true': 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      'false': '',
    },
  },
  defaultVariants: {
    speaking: 'false',
    pinned: 'false',
  },
})

/**
 * Name chip anchored to the bottom-left of the tile.
 * Semi-transparent bg keeps it legible over any media content.
 */
export const videoTileNameChipClass =
  'absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm'

/**
 * Mic-muted icon container — sits inside the name chip at the trailing edge.
 */
export const videoTileMicIconClass = 'text-destructive'

/**
 * Avatar fallback circle — centred in the tile when no media stream is available.
 */
export const videoTileAvatarFallbackClass =
  'absolute inset-0 flex items-center justify-center'

/** Inner circle with initials. */
export const videoTileAvatarCircleClass =
  'flex size-16 items-center justify-center rounded-full bg-card text-foreground text-xl font-semibold select-none'

/**
 * Reaction badge slot — anchored to the top-right corner.
 */
export const videoTileReactionBadgeClass =
  'absolute right-2 top-2 flex items-center justify-center rounded-full bg-background/70 px-1.5 py-0.5 text-sm backdrop-blur-sm'
