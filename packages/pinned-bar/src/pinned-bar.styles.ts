import { cva } from '@refraction-ui/shared'

/**
 * The strip itself. The left accent bar is decoration only: the pin glyph and
 * the "Pinned messages" region name carry the meaning.
 */
export const pinnedBarRootClass = [
  'flex w-full min-w-0 items-center gap-2 border-b border-l-2 border-border border-l-primary',
  'bg-background px-2 py-1 text-sm text-foreground',
].join(' ')

/** Decorative pin glyph at the start of the strip. */
export const pinnedBarPinIconClass =
  'inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:h-full [&>svg]:w-full'

/**
 * Wrapper for everything hidden while collapsed. The display utility lives in
 * the variant (not the base) so collapsing does not depend on Tailwind
 * preflight's `[hidden]` rule: without it, a `flex` class beats the UA
 * `display: none` and the "hidden" content stays visible.
 */
export const pinnedBarContentVariants = cva({
  base: 'min-w-0 flex-1 items-center gap-1',
  variants: {
    collapsed: {
      true: 'hidden',
      false: 'flex',
    },
  },
  defaultVariants: {
    collapsed: 'false',
  },
})

/**
 * The author + snippet block. As a button (when `onOpen` is set) it gets a
 * 44 px minimum height and the shared focus ring. `min-w-0` lets the text
 * children truncate inside the flex row.
 */
export const pinnedBarSnippetVariants = cva({
  base: 'flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center rounded-md px-2 text-left',
  variants: {
    interactive: {
      true: [
        'cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'motion-reduce:transition-none',
      ].join(' '),
      false: '',
    },
  },
  defaultVariants: {
    interactive: 'false',
  },
})

/** Author line: bold weight, not colour, sets it apart from the snippet. */
export const pinnedBarAuthorClass = 'block w-full truncate text-xs font-semibold'

/** Single-line snippet; the full text stays in the DOM for assistive tech. */
export const pinnedBarSnippetTextClass = 'block w-full truncate text-sm text-muted-foreground'

/** "2 of 5". Tabular digits keep the controls from shifting as it changes. */
export const pinnedBarPositionClass = 'shrink-0 px-1 text-xs tabular-nums text-muted-foreground'

/** Collapsed replacement for the content ("5 pinned messages"). */
export const pinnedBarSummaryClass = 'min-w-0 flex-1 truncate px-2 text-sm text-muted-foreground'

/** Row of icon controls. */
export const pinnedBarControlsClass = 'flex shrink-0 items-center gap-0.5'

/** Visually hidden polite live region. */
export const pinnedBarLiveRegionClass = 'sr-only'
