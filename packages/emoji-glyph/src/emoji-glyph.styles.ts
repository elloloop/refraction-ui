import { cva } from '@refraction-ui/shared'

/**
 * The glyph box. Sized by the adapter (width, height and font-size all follow
 * `size`), it sits on the text baseline like an inline icon.
 */
export const emojiGlyphClass = [
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden',
  'align-[-0.125em] leading-none select-none',
].join(' ')

/**
 * One drawing layer (native text, Twemoji still or animation). Layers are
 * stacked and cross-fade so the box never jumps while art loads; the fade
 * stops under reduced motion.
 */
export const emojiGlyphLayerVariants = cva({
  base: 'transition-opacity duration-150 motion-reduce:transition-none',
  variants: {
    visible: {
      true: 'opacity-100',
      false: 'opacity-0',
    },
  },
  defaultVariants: {
    visible: 'false',
  },
})

/** Native glyph layer: the in-flow text that gives the box its metrics. */
export const emojiGlyphNativeClass = 'leading-none'

/** Twemoji still and animation layers, drawn over the native glyph. */
export const emojiGlyphArtClass =
  'pointer-events-none absolute inset-0 size-full select-none object-contain'
