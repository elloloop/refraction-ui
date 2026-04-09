import { cva } from '@elloloop/shared'
import type { TokenContract } from '@elloloop/shared'

export const selectTokens: TokenContract = {
  name: 'select',
  tokens: {
    bg: { variable: '--rfr-select-bg', fallback: 'hsl(var(--background))' },
    fg: { variable: '--rfr-select-fg', fallback: 'hsl(var(--foreground))' },
    border: { variable: '--rfr-select-border', fallback: 'hsl(var(--border))' },
    ring: { variable: '--rfr-select-ring', fallback: 'hsl(var(--ring))' },
  },
}

export const selectTriggerVariants = cva({
  base: 'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-8 text-xs',
      default: 'h-9 text-sm',
      lg: 'h-10 text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const selectContentVariants = cva({
  base: 'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
  variants: {
    position: {
      popper: 'translate-y-1',
      'item-aligned': '',
    },
  },
  defaultVariants: {
    position: 'popper',
  },
})

export const selectItemVariants = cva({
  base: 'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  variants: {
    selected: {
      true: 'bg-accent/50',
      false: '',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})
