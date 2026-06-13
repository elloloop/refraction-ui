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

/** A single grouped speaker block (header + text lines). */
export const transcriptBlockVariants = cva({
  base: 'flex flex-col gap-1',
  variants: {
    compact: {
      true: 'gap-0.5',
      false: '',
    },
  },
  defaultVariants: {
    compact: 'false',
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

/** A single line of transcript text. */
export const transcriptTextLineClass =
  'text-sm text-foreground/80 leading-relaxed'
