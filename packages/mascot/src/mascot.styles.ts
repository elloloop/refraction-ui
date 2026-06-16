import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const mascotTokens: TokenContract = {
  name: 'mascot',
  tokens: {
    primary: { variable: '--rfr-mascot-primary', fallback: '138 60% 51%' },
    secondary: { variable: '--rfr-mascot-secondary', fallback: '138 60% 83%' },
    accent: { variable: '--rfr-mascot-accent', fallback: '26 100% 67%' },
    stroke: { variable: '--rfr-mascot-stroke', fallback: '139 59% 16%' },
  },
}

export const mascotVariants = cva({
  base: 'inline-block select-none transition-all duration-300',
  variants: {
    size: {
      sm: 'w-24 h-auto',
      md: 'w-36 h-auto',
      lg: 'w-48 h-auto',
      xl: 'w-64 h-auto',
    },
    animation: {
      none: '',
      bounce: 'motion-safe:animate-bounce',
      float: 'rfr-mascot-float',
    },
  },
  defaultVariants: {
    size: 'md',
    animation: 'none',
  },
})
