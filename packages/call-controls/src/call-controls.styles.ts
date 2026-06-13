import { cva } from '@refraction-ui/shared'

/**
 * Toolbar container — flex row, centred, with a card background and gap
 * between the control buttons.
 */
export const callControlsVariants = cva({
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-xl bg-card px-4 py-3',
    'shadow-sm border border-border',
  ].join(' '),
  variants: {
    size: {
      sm: 'gap-1.5 px-3 py-2',
      md: 'gap-2 px-4 py-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Individual call-control button.
 *
 * `tone` variants:
 * - `default`     → neutral muted appearance (standard inactive controls)
 * - `active`      → primary/highlighted (e.g. mic on, screen-share running)
 * - `destructive` → red/danger (leave button or a muted mic indicator)
 *
 * `size` variants match the toolbar container.
 */
export const callControlButtonVariants = cva({
  base: [
    'inline-flex flex-col items-center justify-center rounded-full',
    'font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer',
  ].join(' '),
  variants: {
    size: {
      sm: 'size-9 text-xs',
      md: 'size-11 text-xs',
    },
    tone: {
      default: 'bg-muted text-foreground hover:bg-muted/80',
      active: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'default',
  },
})

/** Label beneath the icon inside a call-control button. */
export const callControlLabelClass =
  'sr-only text-[10px] leading-none mt-0.5'
