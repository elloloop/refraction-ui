import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const switchTokens: TokenContract = {
  name: 'switch',
  tokens: {
    bg: { variable: '--rfr-switch-bg', fallback: 'hsl(var(--input))' },
    'bg-checked': { variable: '--rfr-switch-bg-checked', fallback: 'hsl(var(--primary))' },
    thumb: { variable: '--rfr-switch-thumb', fallback: 'hsl(var(--background))' },
    ring: { variable: '--rfr-switch-ring', fallback: 'hsl(var(--ring))' },
  },
}

export const switchVariants = cva({
  base: 'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    checked: {
      true: 'bg-primary',
      false: 'bg-input',
    },
    size: {
      sm: 'h-4 w-7',
      default: 'h-5 w-9',
      lg: 'h-6 w-11',
    },
  },
  defaultVariants: {
    checked: 'false',
    size: 'default',
  },
})

export const switchThumbVariants = cva({
  base: 'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
  variants: {
    checked: {
      true: '',
      false: 'translate-x-0',
    },
    size: {
      sm: 'h-3 w-3',
      default: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    checked: 'false',
    size: 'default',
  },
  compoundVariants: [
    { checked: 'true', size: 'sm', class: 'translate-x-3' },
    { checked: 'true', size: 'default', class: 'translate-x-4' },
    { checked: 'true', size: 'lg', class: 'translate-x-5' },
  ],
})
