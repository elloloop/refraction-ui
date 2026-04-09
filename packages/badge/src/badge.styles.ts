import { cva } from '@elloloop/shared'

export const badgeVariants = cva({
  base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
      primary: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 font-semibold',
      outline: 'text-foreground',
      success: 'border-transparent bg-green-500 text-white shadow hover:bg-green-500/80 font-semibold',
      warning: 'border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-500/80 font-semibold',
    },
    size: {
      sm: 'px-2 py-0 text-[10px]',
      md: 'px-2.5 py-0.5 text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})
