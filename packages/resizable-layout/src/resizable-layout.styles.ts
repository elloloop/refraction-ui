import { cva } from '@elloloop/shared'
import type { TokenContract } from '@elloloop/shared'

export const resizableLayoutTokens: TokenContract = {
  name: 'resizable-layout',
  tokens: {
    dividerColor: { variable: '--rfr-resizable-divider-color', fallback: 'hsl(var(--border))' },
    dividerHover: { variable: '--rfr-resizable-divider-hover', fallback: 'hsl(var(--primary))' },
    dividerSize: { variable: '--rfr-resizable-divider-size', fallback: '4px' },
  },
}

export const resizableLayoutVariants = cva({
  base: 'flex h-full w-full',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

export const resizableDividerVariants = cva({
  base: 'relative flex items-center justify-center bg-border transition-colors hover:bg-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:bg-primary/70',
  variants: {
    orientation: {
      horizontal: 'w-1 cursor-col-resize',
      vertical: 'h-1 cursor-row-resize',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

export const resizablePaneVariants = cva({
  base: 'overflow-auto',
  variants: {
    orientation: {
      horizontal: 'h-full',
      vertical: 'w-full',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})
