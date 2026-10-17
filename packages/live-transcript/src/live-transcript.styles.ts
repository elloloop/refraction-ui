import { cva } from '@refraction-ui/shared'

/**
 * Scroll container that wraps all speaker blocks.
 * The `compact` variant tightens the gap between blocks.
 */
export const liveTranscriptVariants = cva({
  base: 'flex flex-col overflow-y-auto p-4 gap-4',
  variants: {
    compact: {
      true: 'gap-2 p-3',
      false: '',
    },
  },
  defaultVariants: {
    compact: 'false',
  },
})

/**
 * A single grouped speaker block (header + text lines). On a two-sided
 * transcript, "me" sits at the end edge and "them" at the start edge, each in
 * its own bubble, so the sides read by position as well as by colour. The
 * "me" tint stays light enough for muted text (timestamps, interim lines) to
 * keep 4.5:1 contrast in every built-in theme.
 */
export const transcriptBlockVariants = cva({
  base: 'flex flex-col gap-1',
  variants: {
    compact: {
      true: 'gap-0.5',
      false: '',
    },
    side: {
      me: 'max-w-[85%] self-end items-end rounded-lg border border-primary/20 bg-primary/5 px-3 py-2',
      them: 'max-w-[85%] self-start items-start rounded-lg bg-muted px-3 py-2',
      none: '',
    },
  },
  defaultVariants: {
    compact: 'false',
    side: 'none',
  },
})

/** The row containing the speaker name and optional timestamp. */
export const transcriptSpeakerRowClass =
  'flex items-baseline gap-2'

/** Speaker name badge / label. */
export const transcriptSpeakerNameClass =
  'text-sm font-semibold text-foreground leading-snug'

/** Timestamp displayed beside the speaker name. */
export const transcriptTimestampClass =
  'text-xs text-muted-foreground tabular-nums'

/**
 * A single line of transcript text. An interim line (still being heard) is
 * muted with a dotted underline, so "not final yet" does not rest on colour.
 */
export const transcriptTextLineVariants = cva({
  base: 'text-sm leading-relaxed',
  variants: {
    interim: {
      true: 'text-muted-foreground underline decoration-dotted decoration-primary decoration-2 underline-offset-4',
      false: 'text-foreground/80',
    },
  },
  defaultVariants: {
    interim: 'false',
  },
})

/**
 * Holds the jump-to-live control at the bottom of the visible area while the
 * reader is scrolled back. It takes no height, so showing or hiding the
 * control never shifts the lines, and lets clicks through beside it.
 */
export const transcriptJumpToLiveBarClass =
  'pointer-events-none sticky bottom-0 flex h-0 items-end justify-center overflow-visible'

/** The jump-to-live control. */
export const transcriptJumpToLiveButtonClass =
  'pointer-events-auto mb-2 inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground shadow-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none'
