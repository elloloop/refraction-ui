import { cva } from '@refraction-ui/shared'

/** Shared focus treatment for every interactive part of the picker. */
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** The picker panel. */
export const gifPickerVariants = cva({
  base: 'flex w-full flex-col gap-2 rounded-lg border border-border bg-popover p-2 text-popover-foreground',
  variants: {
    size: {
      sm: 'max-w-xs',
      md: 'max-w-sm',
      lg: 'max-w-md',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Extra classes layered on the shared input styles for the search box. */
export const gifPickerSearchClass = `${FOCUS_RING} [&::-webkit-search-cancel-button]:cursor-pointer`

/** Tab list stretched across the panel. */
export const gifPickerTabListClass = 'w-full'

/** Each tab trigger: equal widths and the shared focus ring. */
export const gifPickerTabClass = `flex-1 ${FOCUS_RING}`

/** The scrollable panel holding the grid and its states. */
export const gifPickerPanelClass = `max-h-80 overflow-y-auto rounded-md ${FOCUS_RING}`

/**
 * The results grid. Column count is applied inline by adapters because it is
 * a runtime value; `items-start` lets each cell keep its own aspect ratio.
 */
export const gifPickerGridClass = 'grid list-none items-start gap-1 p-0.5'

/** A GIF cell button. `min-h-11` keeps very wide GIFs at a 44 px target. */
export const gifPickerItemClass = [
  'relative block w-full min-h-11 overflow-hidden rounded-md bg-muted',
  'transition-shadow motion-reduce:transition-none hover:ring-2 hover:ring-primary',
  FOCUS_RING,
].join(' ')

/** The image fills its aspect-ratio cell. */
export const gifPickerImageClass = 'block h-full w-full object-cover'

/** Per-item status pill, e.g. "In review" — text, never colour alone. */
export const gifPickerBadgeClass =
  'pointer-events-none absolute bottom-1 left-1 rounded border border-border bg-background/90 px-1.5 py-0.5 text-xs font-medium text-foreground'

/** Placeholder cell while the first page loads. */
export const gifPickerSkeletonClass = 'aspect-square w-full rounded-md bg-muted motion-safe:animate-pulse'

/** Centered message for the empty, loading and error states. */
export const gifPickerMessageVariants = cva({
  base: 'flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm',
  variants: {
    tone: {
      neutral: 'text-muted-foreground',
      error: 'text-foreground',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

/** Inline status under the grid (loading more / load-more failed). */
export const gifPickerInlineStatusClass = 'flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground'

/** Footer row: load more and the attribution slot. */
export const gifPickerFooterClass = 'flex min-h-6 items-center justify-between gap-2 px-1 text-xs text-muted-foreground'

/** Wrapper for the provider attribution (e.g. "Powered by …"). */
export const gifPickerAttributionClass = 'ml-auto flex items-center gap-1 text-xs text-muted-foreground'

/** Visually hidden but announced (live region). */
export const gifPickerSrOnlyClass = 'sr-only'
