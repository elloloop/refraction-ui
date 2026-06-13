import { cva } from '@refraction-ui/shared'

/**
 * The outer minimap box: small, rounded, bordered, card background.
 * The `interactive` variant switches to grab cursor for clickable minimaps.
 */
export const miniMapVariants = cva({
  base: [
    'relative overflow-hidden rounded-md border border-border bg-card',
    'select-none',
  ].join(' '),
  variants: {
    interactive: {
      true: 'cursor-grab active:cursor-grabbing',
      false: '',
    },
  },
  defaultVariants: {
    interactive: 'false',
  },
})

/** A single node dot in the minimap (represents one `MiniMapItem`). */
export const miniMapDotClass =
  'absolute rounded-sm bg-muted'

/**
 * The draggable viewport indicator rectangle.
 * Uses a semi-transparent primary fill with a primary ring/border.
 */
export const miniMapViewportClass =
  'absolute rounded-sm border border-primary ring-1 ring-primary bg-primary/10'
