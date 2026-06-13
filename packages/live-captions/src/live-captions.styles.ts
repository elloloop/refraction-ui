import { cva } from '@refraction-ui/shared'

/**
 * Caption overlay container — an absolute-friendly, translucent dark surface
 * centred over its positioned ancestor (e.g. a video element).
 */
export const liveCaptionsVariants = cva({
  base: [
    'relative mx-auto w-full max-w-2xl rounded-xl',
    'bg-card/80 backdrop-blur-sm',
    'px-4 py-3 space-y-1',
  ].join(' '),
  variants: {
    /** Controls how the container is positioned in the layout. */
    position: {
      /** Sits in normal document flow (default). */
      static: '',
      /** Absolutely positioned — consumer places it with inset utilities. */
      absolute: 'absolute',
    },
  },
  defaultVariants: {
    position: 'static',
  },
})

/**
 * A single cue line inside the overlay.
 * Non-final (interim) cues get a dimmed italic treatment to signal they may change.
 */
export const liveCaptionsCueVariants = cva({
  base: 'text-sm leading-snug text-foreground',
  variants: {
    interim: {
      true: 'opacity-60 italic',
      false: '',
    },
  },
  defaultVariants: {
    interim: 'false',
  },
})

/** Speaker-name prefix — rendered slightly muted to distinguish it from the speech text. */
export const liveCaptionsSpeakerClass = 'font-medium text-muted-foreground'
