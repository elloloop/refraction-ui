import { cva } from '@elloloop/shared'

export const statsGridVariants = cva({
  base: 'grid gap-4',
  variants: {
    columns: {
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
      '4': 'grid-cols-4',
    },
  },
  defaultVariants: {
    columns: '3',
  },
})

export const statCardVariants = cva({
  base: 'rounded-lg border p-4 text-center shadow-sm',
  variants: {
    color: {
      default: 'bg-card text-card-foreground',
      primary: 'bg-primary/10 text-primary border-primary/20',
      success: 'bg-green-500/10 text-green-700 border-green-500/20',
      warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  },
  defaultVariants: {
    color: 'default',
  },
})

export const badgeGridVariants = cva({
  base: 'grid gap-4',
  variants: {
    columns: {
      '3': 'grid-cols-3',
      '4': 'grid-cols-4',
      '5': 'grid-cols-5',
    },
  },
  defaultVariants: {
    columns: '4',
  },
})

export const badgeItemVariants = cva({
  base: 'flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-opacity',
  variants: {
    state: {
      unlocked: 'opacity-100 bg-card',
      locked: 'opacity-50 bg-muted grayscale',
    },
  },
  defaultVariants: {
    state: 'locked',
  },
})

export const progressBarVariants = cva({
  base: 'h-2 w-full overflow-hidden rounded-full bg-secondary',
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
