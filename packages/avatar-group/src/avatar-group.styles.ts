import { cva } from '@elloloop/shared'

export const avatarGroupStyles =
  'flex items-center -space-x-2'

export const avatarVariants = cva({
  base: 'relative inline-flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-medium overflow-hidden ring-2 ring-background',
  variants: {
    size: {
      xs: 'h-6 w-6 text-[10px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const avatarOverflowBadgeVariants = cva({
  base: 'relative inline-flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-medium ring-2 ring-background',
  variants: {
    size: {
      xs: 'h-6 w-6 text-[10px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const avatarImageStyles =
  'h-full w-full object-cover'

export const avatarPresenceDotVariants = cva({
  base: 'absolute bottom-0 right-0 rounded-full border-2 border-background',
  variants: {
    size: {
      xs: 'h-2 w-2',
      sm: 'h-2.5 w-2.5',
      md: 'h-3 w-3',
      lg: 'h-3.5 w-3.5',
      xl: 'h-4 w-4',
    },
    status: {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      dnd: 'bg-red-500',
    },
  },
  defaultVariants: {
    size: 'md',
    status: 'offline',
  },
})
