import { cva } from '@refraction-ui/shared'

/**
 * A key as it is printed. The thick bottom border is the key's "lip": pressing
 * flattens it and nudges the cap down, so the held state reads by shape, not
 * only by colour. Highlighting adds a ring (a shape cue) as well as a tint.
 * `align-baseline` keeps the legend on the text baseline inside a sentence.
 */
export const keycapVariants = cva({
  base: [
    'inline-flex items-center justify-center gap-1 align-baseline whitespace-nowrap select-none',
    'rounded-md border border-border bg-background font-mono font-medium leading-none text-foreground',
    'transition-[transform,background-color,border-color,box-shadow] duration-100 motion-reduce:transition-none',
  ].join(' '),
  variants: {
    size: {
      sm: 'h-5 min-w-5 px-1 text-xs',
      md: 'h-6 min-w-6 px-1.5 text-sm',
      lg: 'h-8 min-w-8 px-2 text-base',
    },
    pressed: {
      true: 'translate-y-px bg-muted shadow-none',
      false: 'border-b-2 shadow-sm',
    },
    highlighted: {
      true: 'border-primary bg-accent text-accent-foreground ring-2 ring-primary ring-offset-1 ring-offset-background',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    pressed: 'false',
    highlighted: 'false',
  },
})

/** Legend row: optional side word, then the glyph / word / icon. */
export const keyLegendClass = 'inline-flex items-center gap-1'

/** The side word ("Right") — set in the body face so it reads as a word, not a key. */
export const keyLegendSideClass = 'font-sans font-normal text-muted-foreground'

/** Wrapper for a custom `icon`, sized to the surrounding text. */
export const keyLegendIconClass = 'inline-flex items-center [&>svg]:size-[1em]'
