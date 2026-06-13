import { cva } from '@refraction-ui/shared'

/**
 * The outer scroll container — a dark monospaced surface that houses all
 * terminal lines. Uses semantic card tokens so it inherits the active theme.
 */
export const terminalVariants = cva({
  base: [
    'relative rounded-lg border border-border bg-card font-mono text-sm',
    'overflow-y-auto overflow-x-auto',
    'p-4 space-y-0.5',
  ].join(' '),
  variants: {
    maxHeight: {
      sm: 'max-h-48',
      md: 'max-h-80',
      lg: 'max-h-[32rem]',
      none: '',
    },
  },
  defaultVariants: {
    maxHeight: 'md',
  },
})

/**
 * A single terminal line. The `kind` variant maps each semantic category to
 * the appropriate semantic token class — no raw color values inline.
 */
export const terminalLineVariants = cva({
  base: 'block whitespace-pre-wrap break-all leading-relaxed',
  variants: {
    kind: {
      /** The user-typed command: full foreground, bold weight. */
      command: 'text-foreground font-semibold',
      /** Normal program output. */
      stdout: 'text-foreground',
      /** Error / stderr output — uses the destructive semantic token. */
      stderr: 'text-destructive',
      /** Informational summary lines — muted, visually de-emphasised. */
      info: 'text-muted-foreground',
      /**
       * Success / passing lines — green-family.
       * Maps to `text-emerald-500` via the Tailwind semantic alias used
       * across the design system; downstream themes can override this token.
       */
      success: 'text-emerald-500 dark:text-emerald-400',
    },
  },
  defaultVariants: {
    kind: 'stdout',
  },
})

/** The prompt symbol (`$`, `❯`, …) preceding a command line. */
export const terminalPromptClass = 'select-none mr-2 text-muted-foreground'
