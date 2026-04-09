import { cva } from '@elloloop/shared'

export const presenceDotVariants = cva({
  base: 'inline-block rounded-full',
  variants: {
    status: {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      dnd: 'bg-red-500',
    },
    size: {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
    },
  },
  defaultVariants: {
    status: 'offline',
    size: 'md',
  },
})

export const presenceContainerStyles =
  'inline-flex items-center gap-1.5'

export const presenceLabelStyles =
  'text-sm text-muted-foreground'
