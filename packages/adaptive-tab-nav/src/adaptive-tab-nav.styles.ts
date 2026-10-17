import { cva } from '@refraction-ui/shared'

// Every docked class carries this variant; it is ADAPTIVE_TAB_NAV_DOCK_MEDIA_QUERY.
// An arbitrary media variant, unlike `max-md:`, reads the same in Tailwind 3 and 4.

/**
 * The nav: a row of pills in the caller's bar; below 768px, a tab bar fixed to
 * the bottom of the viewport that keeps clear of a phone's home indicator. In
 * a crowded bar it may shrink, and the tabs truncate their labels, rather than
 * widen the page.
 */
export const adaptiveTabNavVariants = cva({
  base: [
    'flex min-w-0 items-center gap-1',
    '[@media(max-width:767px)]:fixed [@media(max-width:767px)]:inset-x-0 [@media(max-width:767px)]:bottom-0 [@media(max-width:767px)]:z-40',
    '[@media(max-width:767px)]:gap-1.5 [@media(max-width:767px)]:border-t [@media(max-width:767px)]:border-border [@media(max-width:767px)]:bg-card',
    '[@media(max-width:767px)]:px-2.5 [@media(max-width:767px)]:pt-2 [@media(max-width:767px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]',
  ].join(' '),
})

/**
 * One tab. Its height never drops below `--rfr-tab-nav-target` (2.75rem, a
 * 44px touch target, unless a surface sets a larger one). Docked, the tabs
 * share the bar's width and stack the icon over the label.
 */
export const adaptiveTabNavItemVariants = cva({
  base: [
    'inline-flex min-h-[var(--rfr-tab-nav-target,2.75rem)] min-w-0 items-center justify-center gap-2 rounded-full px-4',
    'text-sm font-medium leading-none no-underline transition-colors motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    '[@media(max-width:767px)]:flex-1 [@media(max-width:767px)]:flex-col [@media(max-width:767px)]:gap-1',
    '[@media(max-width:767px)]:rounded-2xl [@media(max-width:767px)]:px-1 [@media(max-width:767px)]:text-xs',
  ].join(' '),
  variants: {
    active: {
      true: 'bg-primary-soft text-primary-soft-foreground',
      false: 'text-foreground hover:bg-muted',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})
