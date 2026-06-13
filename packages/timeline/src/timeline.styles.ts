import { cva } from '@refraction-ui/shared'

/**
 * Outer rail / list container.
 *
 * Vertical: a single column; horizontal: a row so items sit side-by-side.
 */
export const timelineVariants = cva({
  base: 'relative',
  variants: {
    orientation: {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row items-start overflow-x-auto',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

/**
 * A single event row / column.
 *
 * In vertical mode items stack with a left gutter for the marker + connector.
 * In horizontal mode each item takes equal width and the connector runs above.
 */
export const timelineItemVariants = cva({
  base: 'relative flex gap-4',
  variants: {
    orientation: {
      vertical: 'flex-row pb-8 last:pb-0',
      horizontal: 'flex-col items-center flex-1 px-2',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

/**
 * The marker / dot that represents the event on the rail.
 *
 * Status variants map directly to semantic token colours so theming is
 * handled at the design-token level, not inline.
 */
export const timelineMarkerVariants = cva({
  base: [
    'relative z-10 flex shrink-0 items-center justify-center',
    'size-3 rounded-full border-2',
    'transition-colors',
  ].join(' '),
  variants: {
    status: {
      done: 'bg-primary border-primary',
      current: 'bg-background border-primary ring-2 ring-primary ring-offset-2 ring-offset-background',
      upcoming: 'bg-muted border-muted-foreground/30',
      default: 'bg-background border-border',
    },
  },
  defaultVariants: {
    status: 'default',
  },
})

/**
 * The connector line drawn between adjacent markers.
 *
 * Vertical: a thin vertical stripe anchored to the left gutter.
 * Horizontal: a thin horizontal stripe anchored above the content row.
 * The last item hides its connector so the rail terminates cleanly.
 */
export const timelineConnectorVariants = cva({
  base: 'absolute bg-border',
  variants: {
    orientation: {
      vertical: 'left-[5px] top-3 w-0.5 h-full',
      horizontal: 'top-[5px] left-1/2 w-full h-0.5',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

/** Wrapper that holds the marker + connector in the gutter column/row. */
export const timelineGutterClass = 'relative flex flex-col items-center'

/** Time / date label rendered near the marker. */
export const timelineTimeClass = 'text-xs text-muted-foreground tabular-nums'

/** Primary event title. */
export const timelineTitleClass = 'text-sm font-medium text-foreground leading-snug'

/** Secondary description text. */
export const timelineDescriptionClass = 'mt-0.5 text-xs text-muted-foreground leading-relaxed'

/** Content block (title + description) next to or below the marker. */
export const timelineContentClass = 'flex flex-col min-w-0'
