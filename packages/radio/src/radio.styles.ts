import { cva } from '@elloloop/shared'

export const radioGroupVariants = cva({
  base: 'flex gap-3',
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export const radioItemVariants = cva({
  base: 'flex items-center gap-2 cursor-pointer',
  variants: {
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: { disabled: 'false' },
})

export const radioCircleVariants = cva({
  base: 'h-4 w-4 rounded-full border border-primary transition-colors',
  variants: {
    checked: {
      true: 'border-primary bg-primary',
      false: 'border-input',
    },
  },
  defaultVariants: { checked: 'false' },
})
