import { cva } from '@elloloop/shared'
import type { TokenContract } from '@elloloop/shared'

export const otpInputTokens: TokenContract = {
  name: 'otp-input',
  tokens: {
    bg: { variable: '--rfr-otp-bg', fallback: 'hsl(var(--background))' },
    fg: { variable: '--rfr-otp-fg', fallback: 'hsl(var(--foreground))' },
    border: { variable: '--rfr-otp-border', fallback: 'hsl(var(--border))' },
    'border-filled': { variable: '--rfr-otp-border-filled', fallback: 'hsl(var(--primary))' },
    ring: { variable: '--rfr-otp-ring', fallback: 'hsl(var(--ring))' },
  },
}

export const otpInputContainerVariants = cva({
  base: 'flex items-center gap-2',
  variants: {
    size: {
      sm: 'gap-1.5',
      default: 'gap-2',
      lg: 'gap-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const otpInputSlotVariants = cva({
  base: 'relative flex items-center justify-center rounded-md border border-input bg-background text-center font-mono shadow-sm transition-all',
  variants: {
    size: {
      sm: 'h-8 w-8 text-sm',
      default: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
    },
    focused: {
      true: 'ring-2 ring-ring ring-offset-background',
      false: '',
    },
    filled: {
      true: 'border-primary',
      false: '',
    },
  },
  defaultVariants: {
    size: 'default',
    focused: 'false',
    filled: 'false',
  },
})
