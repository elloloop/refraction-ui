import { cva } from '@refraction-ui/shared'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/**
 * Panel classes added to DialogContent: wider on larger screens, capped in
 * height so the list scrolls inside it, and no transition under reduced motion.
 */
export const shortcutsDialogContentClass =
  'sm:max-w-2xl max-h-[85vh] grid-rows-[auto_auto_minmax(0,1fr)] motion-reduce:transition-none'

/** Heading block; leaves room on the right for the absolutely placed close button. */
export const shortcutsDialogHeaderClass = 'pr-12'

/** The search field. Tall enough (44 px) to be an easy touch target. */
export const shortcutsDialogSearchClass = [
  'flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground',
  'placeholder:text-muted-foreground',
  FOCUS_RING,
].join(' ')

/** Scrolling list of sections. */
export const shortcutsDialogListClass = 'min-h-0 overflow-y-auto overscroll-contain space-y-6'

/** A group section. */
export const shortcutsDialogSectionClass = 'space-y-2'

/** A group heading. Uppercase plus weight mark it as a heading, not colour alone. */
export const shortcutsDialogGroupHeadingClass =
  'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

/** Rows of a section. */
export const shortcutsDialogRowsClass = 'divide-y divide-border rounded-md border border-border'

/** One row: what the shortcut does, then its keys. */
export const shortcutsDialogRowClass =
  'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2'

/** A row's description. */
export const shortcutsDialogDescriptionClass = 'text-sm text-foreground'

/** Every combo of a row, separated by the `alternative` word. */
export const shortcutsDialogCombosClass = 'inline-flex flex-wrap items-center gap-2'

/** The keys of one combo. */
export const shortcutsDialogComboClass = 'inline-flex items-center gap-1'

/** The word between alternative combos ("or"). */
export const shortcutsDialogAlternativeClass = 'text-xs text-muted-foreground'

/** Shown when nothing matches the search. */
export const shortcutsDialogEmptyClass = 'py-8 text-center text-sm text-muted-foreground'

/** Close button: an icon-only control with a 44 px hit area. */
export const shortcutsDialogCloseVariants = cva({
  base: [
    'absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-md',
    'text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
    'motion-reduce:transition-none',
    FOCUS_RING,
  ].join(' '),
})
