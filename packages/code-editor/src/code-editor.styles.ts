import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const codeEditorTokens: TokenContract = {
  name: 'code-editor',
  tokens: {
    bg: { variable: '--rfr-code-editor-bg', fallback: 'hsl(var(--background))' },
    fg: { variable: '--rfr-code-editor-fg', fallback: 'hsl(var(--foreground))' },
    headerBg: { variable: '--rfr-code-editor-header-bg', fallback: 'hsl(var(--muted))' },
    border: { variable: '--rfr-code-editor-border', fallback: 'hsl(var(--border))' },
    lineNumberFg: { variable: '--rfr-code-editor-line-number', fallback: 'hsl(var(--muted-foreground))' },
  },
}

export const codeEditorVariants = cva({
  base: 'flex flex-col rounded-lg border overflow-hidden font-mono text-sm',
  variants: {
    theme: {
      light: 'bg-white text-gray-900 border-gray-200',
      dark: 'bg-gray-900 text-gray-100 border-gray-700',
    },
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    theme: 'light',
    size: 'default',
  },
})
