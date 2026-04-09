import { cva } from '@elloloop/shared'

export const reactionBarStyles =
  'flex flex-wrap items-center gap-1'

export const reactionPillVariants = cva({
  base: 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs cursor-pointer transition-colors hover:bg-accent',
  variants: {
    state: {
      active: 'border-primary bg-primary/10 text-primary',
      inactive: 'border-border bg-background text-foreground',
    },
  },
  defaultVariants: {
    state: 'inactive',
  },
})

export const reactionAddButtonStyles =
  'inline-flex items-center justify-center h-6 w-6 rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground hover:text-foreground cursor-pointer transition-colors text-xs'

export const reactionEmojiStyles = 'text-sm'
export const reactionCountStyles = 'text-xs font-medium tabular-nums'
