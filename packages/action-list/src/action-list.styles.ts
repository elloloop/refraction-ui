import { cva } from '@refraction-ui/shared'

/** The list: rows separated by hairlines, no bullets. */
export const actionListClass = 'm-0 flex list-none flex-col divide-y divide-border-subtle p-0'

/** A row button: full width, whole row is the hit target. */
export const actionListItemVariants = cva({
  base:
    'flex w-full items-center gap-4 bg-transparent text-left text-sm text-foreground transition-colors ' +
    'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ' +
    'disabled:pointer-events-none disabled:opacity-50',
  variants: {
    density: {
      default: 'px-4 py-3',
      compact: 'px-3 py-2',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

/** Leading text column (title, description, meta). */
export const actionListItemBodyClass = 'flex min-w-0 flex-1 flex-col gap-0.5'
/** Primary line. */
export const actionListItemTitleClass = 'break-words font-semibold text-foreground'
/** Supporting line under the title. */
export const actionListItemDescriptionClass = 'break-words text-xs text-muted-foreground'
/** Tertiary line (owner, tags, ids). */
export const actionListItemMetaClass = 'break-words text-xs text-muted-foreground'
/** Trailing column (dates, sizes, counts). */
export const actionListItemTrailingClass =
  'flex flex-none items-center gap-4 text-xs tabular-nums text-muted-foreground'
