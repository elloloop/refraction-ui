import { cva } from '@refraction-ui/shared'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Outer stack of groups. */
export const taskListClass = 'flex flex-col gap-4 text-foreground'

/** Bar above the groups holding the select-all checkbox in selection mode. */
export const taskListToolbarClass = 'flex min-h-11 items-center gap-3 px-3 text-sm text-muted-foreground'

/** A label wrapping a checkbox plus its text. */
export const taskListSelectAllLabelClass = 'inline-flex cursor-pointer items-center gap-3'

/** One group: header + rows. */
export const taskGroupClass = 'rounded-lg border border-border bg-card'

/** Header row: the fold trigger plus an optional trailing slot. */
export const taskGroupHeaderClass = 'flex items-center gap-2 pr-2'

/** The fold toggle; a full-width, ≥44px-tall button. */
export const taskGroupTriggerClass = [
  'group/task-trigger flex min-h-11 flex-1 items-center gap-2 rounded-lg px-3 text-left',
  'hover:bg-accent hover:text-accent-foreground',
  FOCUS_RING,
].join(' ')

/** Chevron that rotates when the group opens (static under reduced motion). */
export const taskGroupChevronClass =
  'size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]/task-trigger:rotate-90'

/** Group title; overdue reads in the destructive tone (its text names it too). */
export const taskGroupTitleVariants = cva({
  base: 'text-sm font-semibold',
  variants: {
    bucket: {
      overdue: 'text-destructive',
      today: 'text-foreground',
      upcoming: 'text-foreground',
      noDate: 'text-foreground',
      done: 'text-muted-foreground',
      none: 'text-foreground',
    },
  },
  defaultVariants: { bucket: 'none' },
})

/** "4 open · 1 overdue". */
export const taskGroupSummaryClass = 'text-xs text-muted-foreground tabular-nums'

/** The `<ul>` of rows. */
export const taskGroupBodyClass = 'flex flex-col divide-y divide-border border-t border-border'

/** Shown when a group has no rows. */
export const taskGroupEmptyClass = 'border-t border-border px-3 py-3 text-sm text-muted-foreground'

/** A row. Selected rows get a fill AND a check in the selection column. */
export const taskRowVariants = cva({
  base: [
    'group/task-row relative flex min-h-11 items-center gap-3 px-3 py-2 text-sm outline-none',
    'transition-colors duration-200 motion-reduce:transition-none',
    'hover:bg-accent/50 cursor-default',
    FOCUS_RING,
  ].join(' '),
  variants: {
    selected: {
      true: 'bg-accent text-accent-foreground',
      false: '',
    },
  },
  defaultVariants: { selected: 'false' },
})

/**
 * Extra classes for the reused Checkbox inside a row: a 44px hit area via a
 * pseudo-element, and a pop when checked that stops under reduced motion.
 */
export const taskRowCheckClass = [
  "relative before:absolute before:-inset-3.5 before:content-['']",
  'data-[state=checked]:motion-safe:animate-scale-in',
  'data-[readonly]:cursor-not-allowed data-[readonly]:opacity-60',
].join(' ')

/** Title text. Completed strikes through; unseen is bold (plus a dot + text). */
export const taskRowTitleVariants = cva({
  base: 'min-w-0 flex-1 truncate transition-colors duration-300 motion-reduce:transition-none',
  variants: {
    completed: {
      true: 'text-muted-foreground line-through',
      false: 'text-foreground',
    },
    unseen: {
      true: 'font-semibold',
      false: 'font-normal',
    },
  },
  defaultVariants: { completed: 'false', unseen: 'false' },
})

/** The unseen dot (decorative; the row also carries the word "Unseen"). */
export const taskRowUnseenDotClass = 'size-2 shrink-0 rounded-full bg-primary'

/** Due chip; the label text states the urgency, the tone reinforces it. */
export const taskRowDueChipVariants = cva({
  base: 'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums',
  variants: {
    tone: {
      normal: 'bg-muted text-muted-foreground',
      soon: 'bg-warning/15 text-foreground',
      overdue: 'bg-destructive/10 text-destructive',
    },
  },
  defaultVariants: { tone: 'normal' },
})

/** Wrapper for the status / owner slots. */
export const taskRowSlotClass = 'inline-flex shrink-0 items-center'

/** Screen-reader-only text. */
export const taskSrOnlyClass = 'sr-only'

/** Bulk action bar container. */
export const bulkActionBarClass = [
  'flex flex-wrap items-center gap-3 rounded-lg border border-border bg-popover px-3 py-2',
  'text-sm text-popover-foreground shadow-md',
  'motion-safe:animate-fade-in-up',
].join(' ')

/** "3 selected". */
export const bulkActionBarCountClass = 'font-medium tabular-nums'

/** Consumer-provided actions. */
export const bulkActionBarActionsClass = 'flex flex-1 flex-wrap items-center gap-2'

/** Icon-only clear button with a 44px target. */
export const bulkActionBarClearClass = [
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground',
  'hover:bg-accent hover:text-accent-foreground',
  FOCUS_RING,
].join(' ')
