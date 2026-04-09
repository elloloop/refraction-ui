import { cva } from '@elloloop/shared'

export const collapsibleContentVariants = cva({
  base: 'overflow-hidden transition-all',
  variants: {
    state: {
      open: 'animate-accordion-down',
      closed: 'animate-accordion-up',
    },
  },
  defaultVariants: {
    state: 'closed',
  },
})
