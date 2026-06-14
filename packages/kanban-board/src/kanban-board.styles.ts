import { cva } from '@refraction-ui/shared'

/** The outer board: horizontal scroll, flex row, gap between columns. */
export const kanbanBoardVariants = cva({
  base: 'flex flex-row gap-4 overflow-x-auto pb-4',
  variants: {},
  defaultVariants: {},
})

/** A single column: muted background, rounded, fixed minimum width. */
export const kanbanColumnVariants = cva({
  base: 'flex flex-col min-w-[260px] max-w-[300px] flex-shrink-0 rounded-xl bg-muted/40',
  variants: {},
  defaultVariants: {},
})

/** Column header row: icon slot + title + count badge. */
export const kanbanColumnHeaderClass =
  'flex items-center gap-2 px-4 pt-4 pb-2'

/** Column title text. */
export const kanbanColumnTitleClass = 'flex-1 text-sm font-semibold text-foreground truncate'

/**
 * Column count badge: a compact pill to the right of the title.
 * Uses muted tokens so it sits quietly against any column accent.
 */
export const kanbanColumnCountClass =
  'ml-auto inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'

/**
 * Thin accent bar directly below the header.
 * Callers apply `style={{ '--kanban-accent': def.accent }}` on the column
 * element; this bar reads `var(--kanban-accent)` via an inline style.
 * When no accent is supplied the bar is invisible (transparent).
 */
export const kanbanAccentBarClass = 'h-0.5 w-full'

/**
 * Note/gate bar shown beneath the accent bar.
 * Displays brief stage notes (e.g. "Technical screen required").
 */
export const kanbanNoteBarClass =
  'mx-4 mb-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground'

/** Column body: card stack with gap, padded sides and bottom. */
export const kanbanColumnBodyClass = 'flex flex-col gap-2 px-3 pb-3'

/**
 * "+N more" overflow button.
 * Styled as a subtle full-width ghost button inside the column.
 */
export const kanbanOverflowButtonClass = [
  'mt-1 w-full rounded-lg border border-dashed border-border',
  'py-1.5 text-center text-xs text-muted-foreground',
  'transition-colors hover:bg-muted hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
].join(' ')

/**
 * Default card surface.
 *
 * Variants:
 * - `clickable: 'true'`  — adds hover treatment for interactive cards.
 * - `clickable: 'false'` — static (default).
 */
export const kanbanCardVariants = cva({
  base: 'rounded-lg border border-border bg-card p-3 text-sm text-foreground',
  variants: {
    clickable: {
      true: 'cursor-pointer transition-colors hover:bg-muted/60',
      false: '',
    },
  },
  defaultVariants: {
    clickable: 'false',
  },
})
