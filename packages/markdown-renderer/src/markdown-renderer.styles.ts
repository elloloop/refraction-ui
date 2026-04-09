import { cva } from '@elloloop/shared'
import type { TokenContract } from '@elloloop/shared'

export const markdownRendererTokens: TokenContract = {
  name: 'markdown-renderer',
  tokens: {
    bg: { variable: '--rfr-markdown-bg', fallback: 'hsl(var(--background))' },
    fg: { variable: '--rfr-markdown-fg', fallback: 'hsl(var(--foreground))' },
    codeBg: { variable: '--rfr-markdown-code-bg', fallback: 'hsl(var(--muted))' },
    linkColor: { variable: '--rfr-markdown-link', fallback: 'hsl(var(--primary))' },
    borderColor: { variable: '--rfr-markdown-border', fallback: 'hsl(var(--border))' },
  },
}

export const proseVariants = cva({
  base: 'prose max-w-none text-foreground leading-relaxed',
  variants: {
    size: {
      sm: 'prose-sm text-sm',
      default: 'prose-base text-base',
      lg: 'prose-lg text-lg',
    },
    theme: {
      light: 'bg-white text-gray-900',
      dark: 'bg-gray-900 text-gray-100',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
