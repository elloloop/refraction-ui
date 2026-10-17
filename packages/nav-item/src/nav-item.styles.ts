import { cva } from '@refraction-ui/shared'

/**
 * The interactive row (button or link). Every presentation keeps at least a
 * 44 px (`size-11` / `min-h-11`) target; the collapsed rail item is a square.
 * Selection is shown by background, weight and the indicator bar — never by
 * colour alone — and `aria-current` carries it to assistive tech.
 */
export const navItemVariants = cva({
  base: [
    'group relative flex items-center rounded-md text-sm no-underline',
    'transition-colors motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  variants: {
    selected: {
      true: 'bg-accent font-semibold text-accent-foreground',
      false: 'font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    },
    collapsed: {
      true: 'size-11 shrink-0 justify-center',
      false: 'min-h-11 w-full gap-3 px-3 py-2',
    },
  },
  defaultVariants: {
    selected: 'false',
    collapsed: 'false',
  },
})

/** Leading bar on the selected item — a shape cue alongside the colour change. */
export const navItemIndicatorClass =
  'pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-primary'

/** Icon box; positions the corner badge and dot when collapsed. */
export const navItemIconClass =
  'relative inline-flex size-5 shrink-0 items-center justify-center [&>svg]:size-5'

/** Visible label (expanded only). */
export const navItemLabelClass = 'min-w-0 flex-1 truncate text-left'

/** Trailing cluster (count + live dot) in the expanded row. */
export const navItemTrailingClass = 'ml-auto inline-flex shrink-0 items-center gap-2'

/** Count badge: inline at the row end, or pinned to the icon's corner. */
export const navItemCountVariants = cva({
  base: [
    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
    'bg-primary text-xs font-semibold leading-none tabular-nums text-primary-foreground',
  ].join(' '),
  variants: {
    placement: {
      inline: '',
      corner: 'absolute -right-2.5 -top-2 ring-2 ring-background',
    },
  },
  defaultVariants: {
    placement: 'inline',
  },
})

/** Live-dot slot: inline at the row end, or pinned to the icon's lower corner. */
export const navItemLiveDotVariants = cva({
  base: 'inline-flex items-center justify-center',
  variants: {
    placement: {
      inline: '',
      corner: 'absolute -bottom-1 -right-1',
    },
  },
  defaultVariants: {
    placement: 'inline',
  },
})

/**
 * Fixed-position tooltip for the collapsed rail item. The shared tooltip
 * animates in; `motion-reduce:animate-none` stops that under reduced motion.
 */
export const navItemTooltipClass = 'fixed -translate-y-1/2 motion-reduce:animate-none'

/**
 * The tooltip trigger wrapper, rendered in both presentations so toggling
 * `collapsed` never remounts the item (which would drop keyboard focus).
 * Collapsed, it is the measured box the tooltip is placed beside; expanded,
 * `contents` removes its box so the full-width row's layout is unchanged.
 */
export const navItemTooltipTriggerVariants = cva({
  variants: {
    collapsed: {
      true: 'inline-flex',
      false: 'contents',
    },
  },
  defaultVariants: {
    collapsed: 'false',
  },
})
