import { cva } from '@refraction-ui/shared'

/** Outer wrapper for the graph canvas area. */
export const graphViewVariants = cva({
  base: 'relative w-full overflow-hidden rounded-lg border border-border bg-background',
  variants: {},
  defaultVariants: {},
})

/**
 * Node chip: a positioned, clickable concept node colored by mastery state.
 *
 * `state` variant drives the visual treatment:
 * - mastered      → filled primary (bg-primary / text-primary-foreground)
 * - in-progress   → accent ring (ring-2 ring-ring bg-accent text-accent-foreground)
 * - not-started   → muted (bg-muted text-muted-foreground)
 * - highlight     → border-primary accent outline (border-primary bg-background text-foreground)
 */
export const graphNodeVariants = cva({
  base: [
    'absolute inline-flex items-center justify-center rounded-md border px-2 py-1',
    'text-xs font-medium leading-none -translate-x-1/2 -translate-y-1/2',
    'transition-colors focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'cursor-default select-none',
  ].join(' '),
  variants: {
    state: {
      mastered: 'border-transparent bg-primary text-primary-foreground',
      'in-progress': 'border-transparent bg-accent text-accent-foreground ring-2 ring-ring',
      'not-started': 'border-transparent bg-muted text-muted-foreground',
      highlight: 'border-primary bg-background text-foreground',
    },
    interactive: {
      true: 'cursor-pointer hover:opacity-90',
      false: 'cursor-default',
    },
  },
  defaultVariants: {
    state: 'not-started',
    interactive: 'false',
  },
})

/** Label text rendered inside each node chip (already embedded in the chip). */
export const graphNodeLabelClass = 'pointer-events-none whitespace-nowrap'

/** SVG edge line/path classes. */
export const graphEdgeClass =
  'fill-none stroke-border stroke-[1.5] opacity-60'

/** Legend chip: a small colored indicator + label for a single mastery state. */
export const graphLegendChipVariants = cva({
  base: 'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
  variants: {
    state: {
      mastered: 'border-transparent bg-primary text-primary-foreground',
      'in-progress': 'border-transparent bg-accent text-accent-foreground ring-1 ring-ring',
      'not-started': 'border-transparent bg-muted text-muted-foreground',
      highlight: 'border-primary bg-background text-foreground',
    },
  },
  defaultVariants: {
    state: 'not-started',
  },
})
