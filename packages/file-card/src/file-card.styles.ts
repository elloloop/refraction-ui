import { cva } from '@refraction-ui/shared'

/**
 * Card shell. `relative` anchors the stretched open control's `::after`
 * overlay; `isolate` keeps the actions' `z-10` local to the card.
 */
export const fileCardVariants = cva({
  base: [
    'relative isolate flex w-full max-w-sm items-center gap-3 rounded-lg border',
    'bg-card p-3 text-card-foreground transition-colors motion-reduce:transition-none',
  ].join(' '),
  variants: {
    status: {
      uploading: 'border-border',
      failed: 'border-destructive',
      done: 'border-border',
    },
    interactive: {
      true: 'hover:bg-accent/50',
      false: '',
    },
  },
  defaultVariants: {
    status: 'done',
    interactive: 'false',
  },
})

/** Square tile behind the kind glyph (or a custom icon/thumbnail). */
export const fileCardIconVariants = cva({
  base: 'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md [&_svg]:size-5',
  variants: {
    status: {
      uploading: 'bg-muted text-muted-foreground',
      failed: 'bg-destructive/10 text-destructive',
      done: 'bg-muted text-muted-foreground',
    },
  },
  defaultVariants: {
    status: 'done',
  },
})

/** Name + metadata + status column; `min-w-0` lets the name shrink. */
export const fileCardBodyClass = 'flex min-w-0 flex-1 flex-col gap-0.5'

/**
 * The element that opens the file (`<button>` or `<a>`). Its `::after`
 * stretches over the whole card so the card is one big click target, and the
 * focus ring is drawn on that overlay so it outlines the card, not the name.
 */
export const fileCardOpenControlClass = [
  'block min-w-0 max-w-full truncate text-left text-sm font-medium text-foreground',
  'rounded-sm outline-none',
  "after:absolute after:inset-0 after:rounded-lg after:content-['']",
  'focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring',
  'focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-background',
].join(' ')

/** The name when the card can't be opened. */
export const fileCardNameClass = 'block min-w-0 truncate text-sm font-medium text-foreground'

/** Kind · size · duration/pixel size. */
export const fileCardMetaClass = 'truncate text-xs text-muted-foreground tabular-nums'

/** Uploading / failed text. Failure also has an icon, so it never relies on colour. */
export const fileCardStatusVariants = cva({
  base: 'flex min-w-0 items-center gap-1 text-xs',
  variants: {
    status: {
      uploading: 'text-muted-foreground tabular-nums',
      failed: 'font-medium text-destructive',
      done: '',
    },
  },
  defaultVariants: {
    status: 'done',
  },
})

export const fileCardStatusIconClass = 'size-3.5 shrink-0'

export const fileCardProgressTrackClass = 'relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted'

/**
 * Progress fill. Width changes glide, and the indeterminate bar pulses; both
 * stop under `prefers-reduced-motion`.
 */
export const fileCardProgressFillVariants = cva({
  base: 'h-full rounded-full bg-primary',
  variants: {
    indeterminate: {
      true: 'w-1/3 animate-pulse motion-reduce:animate-none',
      false: 'transition-[width] duration-300 ease-out motion-reduce:transition-none',
    },
  },
  defaultVariants: {
    indeterminate: 'false',
  },
})

/**
 * Action buttons sit above the stretched overlay (`z-10`) as siblings of the
 * open control, so they're never nested inside it.
 */
export const fileCardActionsClass = 'relative z-10 flex shrink-0 items-center gap-1'
