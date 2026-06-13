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
 * A single floating reaction item.
 *
 * The float-up animation is driven by the class
 * `animate-[float-up_3s_ease-out_forwards]`. Consumers must supply the
 * `@keyframes float-up` rule in their global CSS or Tailwind config:
 *
 * ```css
 * @keyframes float-up {
 *   0%   { transform: translateY(0);    opacity: 1; }
 *   80%  { opacity: 1; }
 *   100% { transform: translateY(-80%); opacity: 0; }
 * }
 * ```
 *
 * Without the keyframe the item will still render in place and fade on removal
 * (graceful degradation).
 */
export const floatingReactionItemClass = [
  'absolute bottom-4',
  'text-3xl leading-none select-none',
  'animate-[float-up_3s_ease-out_forwards]',
].join(' ')

/**
 * Accessible label node for the reaction — visually hidden so screen readers
 * read the emoji description once and don't repeat the decorative glyph.
 */
export const floatingReactionLabelClass = 'sr-only'
