import { cva } from '@refraction-ui/shared'

/** The tab bar container row. */
export const editorTabsVariants = cva({
  base: 'inline-flex items-end gap-0 border-b border-border bg-muted/40 overflow-x-auto',
  variants: {},
  defaultVariants: {},
})

/**
 * A single tab button. The `state` variant switches between active and
 * inactive treatments so adapters never inline these classes.
 */
export const editorTabVariants = cva({
  base: [
    'group inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium',
    'border-b-2 transition-colors select-none whitespace-nowrap',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
  ].join(' '),
  variants: {
    state: {
      active: [
        'border-primary text-foreground bg-background',
        'border-t border-l border-r border-border border-b-background -mb-px',
      ].join(' '),
      inactive: [
        'border-transparent text-muted-foreground',
        'hover:text-foreground hover:bg-background/60',
      ].join(' '),
    },
  },
  defaultVariants: {
    state: 'inactive',
  },
})

/** The dot indicator shown when a tab has unsaved changes. */
export const editorTabDirtyDotClass =
  'size-1.5 rounded-full bg-amber-400 shrink-0'

/** The close button inside a tab. */
export const editorTabCloseButtonClass = [
  'ml-1 inline-flex items-center justify-center rounded-sm size-4 shrink-0',
  'text-muted-foreground opacity-0 transition-opacity',
  'group-hover:opacity-100 focus-visible:opacity-100',
  'hover:bg-accent hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
].join(' ')

/** The optional icon slot to the left of the label. */
export const editorTabIconClass = 'shrink-0 text-[0.85em] leading-none'
