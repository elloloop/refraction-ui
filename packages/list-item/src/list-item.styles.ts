import { cva } from '@refraction-ui/shared'

/** Visible keyboard focus ring shared by every focusable part of a row. */
export const listItemFocusRingClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** The `<ul>` holding rows: no bullets, rows stacked with a hairline gap. */
export const listItemGroupClass = 'm-0 flex list-none flex-col gap-0.5 p-0'

/**
 * The `<li>` row. Selection is shown by a background AND a leading bar (a
 * shape), so it is never conveyed by colour alone.
 */
export const listItemVariants = cva({
  base: [
    'relative flex w-full min-w-0 items-center rounded-md text-left text-foreground',
    'transition-colors motion-reduce:transition-none',
    'before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full',
  ].join(' '),
  variants: {
    selected: {
      true: 'bg-accent text-accent-foreground before:bg-primary',
      false: 'hover:bg-muted before:bg-transparent',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})

/**
 * The content box (leading · body · trailing). In navigation it is the
 * `<button>`, so it resets native button chrome; the min-heights keep even a
 * compact row a ≥44 px pointer target.
 */
export const listItemContentVariants = cva({
  base: [
    'flex min-w-0 flex-1 items-center gap-3 rounded-md border-0 bg-transparent px-3',
    'text-left text-inherit font-[inherit]',
  ].join(' '),
  variants: {
    density: {
      compact: 'min-h-11 py-1.5',
      comfortable: 'min-h-14 py-2.5',
    },
    interactive: {
      true: `cursor-pointer ${listItemFocusRingClass}`,
      false: '',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    interactive: 'false',
  },
})

/** Leading slot (avatar, icon). */
export const listItemLeadingClass = 'flex flex-none items-center'

/** Text column; `min-w-0` lets its children truncate instead of overflowing. */
export const listItemBodyClass = 'flex min-w-0 flex-1 flex-col'

/** First line: title (shrinks + truncates) and meta (never shrinks). */
export const listItemTitleRowClass = 'flex min-w-0 items-baseline gap-2'

/** Title: single-line ellipsis; unread emphasis is a weight change (not colour). */
export const listItemTitleVariants = cva({
  base: 'min-w-0 flex-1 truncate text-sm text-foreground',
  variants: {
    emphasized: {
      true: 'font-bold',
      false: 'font-medium',
    },
  },
  defaultVariants: {
    emphasized: 'false',
  },
})

/** Meta (a time) at the end of the title line: always fully visible. */
export const listItemMetaVariants = cva({
  base: 'flex-none whitespace-nowrap text-xs tabular-nums',
  variants: {
    emphasized: {
      true: 'font-semibold text-foreground',
      false: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    emphasized: 'false',
  },
})

/** Subtitle (a message preview): single-line ellipsis. */
export const listItemSubtitleVariants = cva({
  base: 'min-w-0 truncate text-sm',
  variants: {
    emphasized: {
      true: 'text-foreground',
      false: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    emphasized: 'false',
  },
})

/** Trailing slot (count, check indicator): never shrinks, so it stays visible. */
export const listItemTrailingClass = 'flex flex-none items-center gap-2 text-xs text-muted-foreground'

/** Wrapper for the separate action control, a sibling of the row's main button. */
export const listItemActionSlotClass = 'flex flex-none items-center pr-1'

/** Icon-only action button: a 44 px (size-11) hit area. */
export const listItemActionButtonClass = [
  'inline-flex size-11 flex-none items-center justify-center rounded-md border-0 bg-transparent',
  'text-muted-foreground transition-colors motion-reduce:transition-none',
  'hover:bg-muted hover:text-foreground',
  'disabled:pointer-events-none disabled:opacity-50',
  listItemFocusRingClass,
].join(' ')
