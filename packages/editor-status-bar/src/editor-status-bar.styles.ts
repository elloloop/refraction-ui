import { cva } from '@refraction-ui/shared'

/**
 * The outer bar — a thin, full-width strip that sits at the bottom of an IDE
 * pane. Uses a monospace font stack so numeric values (line, col) don't shift
 * width as they update.
 */
export const editorStatusBarVariants = cva({
  base: [
    'flex items-center justify-between',
    'w-full h-6 px-2 gap-4',
    'text-xs font-mono',
    'bg-muted text-muted-foreground',
    'border-t border-border',
    'select-none',
  ].join(' '),
  variants: {},
  defaultVariants: {},
})

/** The left or right group that holds a cluster of segments. */
export const statusBarGroupClass = 'flex items-center gap-3 overflow-hidden'

/**
 * A single segment pill. The `tone` variant maps to semantic token classes so
 * adapters never inline colour values.
 */
export const statusBarSegmentVariants = cva({
  base: 'inline-flex items-center whitespace-nowrap truncate leading-none',
  variants: {
    tone: {
      default: 'text-muted-foreground',
      muted: 'text-muted-foreground/60',
      accent: 'text-primary',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})
