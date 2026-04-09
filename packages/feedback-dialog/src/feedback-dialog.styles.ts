import { cva } from '@elloloop/shared'

export const feedbackDialogVariants = cva({
  base: 'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg',
  variants: {
    type: {
      text: 'max-w-md',
      video: 'max-w-lg',
      general: 'max-w-md',
    },
  },
  defaultVariants: {
    type: 'general',
  },
})
