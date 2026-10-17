import { cva } from '@refraction-ui/shared'

/**
 * Overlay container — fills the parent with absolute positioning so reactions
 * float over content. pointer-events-none keeps the overlay non-interactive;
 * overflow-hidden clips reactions that drift outside the bounds.
 */
export const floatingReactionsVariants = cva({
  base: 'absolute inset-0 pointer-events-none overflow-hidden',
  variants: {
    /**
     * Whether the overlay is currently active (has reactions). The parent may
     * toggle visibility, but we keep the node mounted to preserve live-region
     * semantics.
     */
    active: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})

/**
 * Names of the keyframes behind the reaction animation. They carry the
 * library prefix so they cannot collide with an app's own keyframes.
 */
export const floatingReactionRiseKeyframes = 'rfr-floating-reaction-rise'
export const floatingReactionFadeKeyframes = 'rfr-floating-reaction-fade'

/**
 * The keyframes the item class animates with. The adapters render this once
 * per page, so no global CSS or Tailwind config is needed.
 *
 * - Rise: the reaction floats up 80% of the overlay's height from where it
 *   rests (`bottom-4`, 1rem), holding full opacity for 80% of its life, then
 *   fades out. This is the same motion as the Flutter FloatingReactions.
 *   `bottom` is animated because a percentage of it is measured against the
 *   overlay, where a translate percentage is measured against the emoji.
 * - Fade: the reduced-motion alternative. The reaction stays where it
 *   appeared and fades out on the same schedule, so the cue that someone
 *   reacted survives without the movement.
 */
export const floatingReactionKeyframes = [
  `@keyframes ${floatingReactionRiseKeyframes} {`,
  '  0% { bottom: 1rem; opacity: 1; }',
  '  80% { opacity: 1; }',
  '  100% { bottom: calc(80% + 1rem); opacity: 0; }',
  '}',
  `@keyframes ${floatingReactionFadeKeyframes} {`,
  '  0%, 80% { opacity: 1; }',
  '  100% { opacity: 0; }',
  '}',
].join('\n')

/**
 * A single floating reaction item.
 *
 * It rises and fades over REACTION_LIFETIME_MS (3 s, the literal below; a test
 * keeps the two in step). Under `prefers-reduced-motion: reduce` it fades in
 * place instead. The keyframes are {@link floatingReactionKeyframes}.
 */
export const floatingReactionItemClass = [
  'absolute bottom-4',
  'text-3xl leading-none select-none',
  'animate-[rfr-floating-reaction-rise_3s_ease-out_forwards]',
  'motion-reduce:animate-[rfr-floating-reaction-fade_3s_ease-out_forwards]',
].join(' ')

/**
 * Accessible label node for the reaction — visually hidden so screen readers
 * read the emoji description once and don't repeat the decorative glyph.
 */
export const floatingReactionLabelClass = 'sr-only'
