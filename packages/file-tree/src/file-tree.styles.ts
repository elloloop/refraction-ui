import { cva } from '@refraction-ui/shared'

/** Tree container. */
export const fileTreeVariants = cva({
  base: 'w-full text-sm',
})

/**
 * A single tree row (treeitem). The `selected` variant carries the
 * selected-row treatment so adapters never inline these classes.
 */
export const fileTreeItemVariants = cva({
  base: [
    'flex w-full cursor-pointer select-none items-center gap-1.5 rounded-md px-2 py-1',
    'text-sm outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ].join(' '),
  variants: {
    selected: {
      true: 'bg-accent text-accent-foreground',
      false: 'text-foreground hover:bg-muted',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})

/** Expand/collapse glyph or file marker preceding the label. */
export const fileTreeGlyphClass = 'w-4 shrink-0 text-center text-muted-foreground'
