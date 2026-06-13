import { cva } from '@refraction-ui/shared'

/**
 * Root wrapper for the flow editor canvas. Sized to fill its container and
 * provides a relative positioning context for the node/edge layers.
 */
export const flowEditorVariants = cva({
  base: 'relative w-full overflow-hidden bg-background border border-border rounded-lg',
  variants: {
    size: {
      sm: 'h-64',
      md: 'h-96',
      lg: 'h-[32rem]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * A single node box. The `selected` variant adds a ring to signal the active
 * selection; semantic token classes are used throughout so theming works
 * without overrides.
 */
export const flowNodeVariants = cva({
  base: [
    'absolute flex items-center justify-center rounded-md border',
    'bg-card border-border text-card-foreground text-sm font-medium',
    'cursor-pointer select-none transition-shadow',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  variants: {
    selected: {
      true: 'ring-2 ring-ring ring-primary shadow-md',
      false: 'hover:border-primary/50 hover:shadow-sm',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})

/** Accessible label text inside a node box. */
export const flowNodeLabelClass = 'px-3 py-2 truncate pointer-events-none'

/**
 * SVG `<path>` element class for an edge. `currentColor` is used so the
 * stroke inherits from `text-muted-foreground` set on the SVG container.
 */
export const flowEdgePathClass =
  'fill-none stroke-current stroke-2 transition-opacity'

/** Text label positioned at the midpoint of an edge. */
export const flowEdgeLabelClass =
  'text-xs fill-muted-foreground select-none pointer-events-none'
