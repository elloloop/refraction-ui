import { cva } from '@refraction-ui/shared'

export const animatedTextVariants = cva({
  base: 'inline-block transition-opacity',
  variants: {
    state: {
      entering: 'opacity-100',
      exiting: 'opacity-0',
      idle: 'opacity-100',
    },
  },
  defaultVariants: {
    state: 'idle',
  },
})

export const typewriterVariants = cva({
  base: 'inline',
  variants: {
    cursor: {
      blinking: 'after:inline-block after:w-[2px] after:h-[1em] after:bg-current after:ml-[1px] after:animate-blink after:align-text-bottom',
      hidden: '',
    },
  },
  defaultVariants: {
    cursor: 'blinking',
  },
})
