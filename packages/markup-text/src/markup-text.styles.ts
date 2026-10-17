import { cva } from '@refraction-ui/shared'

/** Horizontal alignment, named after Flutter's `TextAlign` values. */
export type MarkupTextAlign = 'start' | 'end' | 'left' | 'right' | 'center' | 'justify'

const FOCUS_RING = [
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
].join(' ')

/**
 * Root element. Long URLs and unbroken strings wrap instead of overflowing.
 * Alignment needs a block box, so any explicit `textAlign` also makes a `span`
 * root block-level (a no-op for `p` / `div`).
 */
export const markupTextVariants = cva({
  base: '[overflow-wrap:anywhere]',
  variants: {
    textAlign: {
      inherit: '',
      start: 'block text-start',
      end: 'block text-end',
      left: 'block text-left',
      right: 'block text-right',
      center: 'block text-center',
      justify: 'block text-justify',
    },
  },
  defaultVariants: {
    textAlign: 'inherit',
  },
})

/** A `**bold**` run (Flutter `strongStyle`'s default). */
export const markupTextStrongClass = 'font-semibold'

/** Inline `` `code` ``; sized relative to the surrounding text. */
export const markupTextCodeClass =
  'rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.875em] text-foreground'

/** Auto-linked URL: underlined so it is never identified by colour alone. */
export const markupTextLinkClass = [
  'rounded-sm text-primary underline underline-offset-2 hover:decoration-2',
  'transition-colors motion-reduce:transition-none',
  FOCUS_RING,
].join(' ')

/**
 * Mention chip. The `interactive` variant is the button form used when the
 * consumer handles mention clicks.
 */
export const markupTextMentionVariants = cva({
  base: 'inline rounded-sm bg-accent px-1 font-medium text-accent-foreground',
  variants: {
    interactive: {
      true: [
        'cursor-pointer border-0 transition-colors motion-reduce:transition-none',
        'hover:bg-primary hover:text-primary-foreground',
        FOCUS_RING,
      ].join(' '),
      false: '',
    },
  },
  defaultVariants: {
    interactive: 'false',
  },
})

/** Visually hidden text (e.g. the "opens in a new tab" hint). */
export const markupTextSrOnlyClass = 'sr-only'
