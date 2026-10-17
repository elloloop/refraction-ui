import { cva } from '@refraction-ui/shared'

/** The player row: play button, scrubber + clock, speed control. */
export const voiceNoteVariants = cva({
  base: 'flex w-full max-w-sm items-center gap-2 rounded-xl border bg-card p-2 text-card-foreground',
  variants: {
    // The error message and icon carry the meaning; the border only echoes it.
    error: {
      true: 'border-destructive',
      false: 'border-border',
    },
  },
  defaultVariants: {
    error: 'false',
  },
})

/** Column holding the scrubber above the clock / status line. */
export const voiceNoteBodyClass = 'flex min-w-0 flex-1 flex-col'

/**
 * The focusable scrubber (`role="slider"`). `min-h-11` keeps a 44 px pointer
 * target around the short waveform; `touch-none` stops touch-drag from
 * scrolling the page while seeking.
 */
export const voiceNoteTrackVariants = cva({
  base: [
    'relative flex min-h-11 w-full touch-none select-none items-center rounded-md',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  variants: {
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: 'cursor-pointer',
    },
  },
  defaultVariants: {
    disabled: 'false',
  },
})

/** Wrapper for the two stacked waveform layers and the playhead. */
export const voiceNoteWaveformClass = 'pointer-events-none relative w-full'

/** Bars not yet played (the waveform canvas draws in `currentColor`). */
export const voiceNoteUnplayedClass = 'text-muted-foreground'

/** Bars already played, clipped to the progress by an inline `clip-path`. */
export const voiceNotePlayedClass = 'absolute inset-0 text-primary'

/**
 * The playhead: a position cue that does not rely on the played / unplayed
 * colour difference.
 */
export const voiceNotePlayheadClass =
  'absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-foreground'

/** Clock / status line under the scrubber. */
export const voiceNoteMetaClass = 'flex min-h-4 items-center gap-1 text-xs tabular-nums'

/** Status line text, by tone. */
export const voiceNoteStatusVariants = cva({
  base: 'inline-flex items-center gap-1',
  variants: {
    tone: {
      muted: 'text-muted-foreground',
      error: 'text-destructive',
    },
  },
  defaultVariants: {
    tone: 'muted',
  },
})

/** Loading spinner; it stops under `prefers-reduced-motion`. */
export const voiceNoteSpinnerClass =
  'size-3 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin motion-reduce:animate-none'

/** Small status icon (error glyph). */
export const voiceNoteStatusIconClass = 'size-3 shrink-0'

/**
 * Extra classes on the speed Button: a 44 px target (min sizes win over
 * Button's `h-8`), steady-width digits, and no colour transition under
 * reduced motion.
 */
export const voiceNoteSpeedClass = [
  'min-h-11 min-w-11 shrink-0 tabular-nums',
  'focus-visible:ring-ring focus-visible:ring-offset-background motion-reduce:transition-none',
].join(' ')
