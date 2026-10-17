import { cva } from '@refraction-ui/shared'
import { FLOATING_REACTION_ITEM_ATTRIBUTE, REACTION_LIFETIME_MS } from './floating-reactions.js'

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
 * A single floating reaction item: where it sits and how it looks. Its motion
 * comes from {@link floatingReactionsStyles}, which animates any element that
 * carries `FLOATING_REACTION_ITEM_ATTRIBUTE`.
 */
export const floatingReactionItemClass = 'absolute bottom-4 text-3xl leading-none select-none'

/** Keyframe names, namespaced so they cannot collide with an app's own. */
export const FLOATING_REACTION_KEYFRAMES = {
  /** Rises by most of the item's height, fading over the last fifth. */
  rise: 'rfr-floating-reaction-rise',
  /** Reduced motion: stays in place, fading over the last fifth. */
  fade: 'rfr-floating-reaction-fade',
} as const

const item = `[${FLOATING_REACTION_ITEM_ATTRIBUTE}]`
const { rise, fade } = FLOATING_REACTION_KEYFRAMES

/**
 * The overlay's motion, shipped with the library so an app needs no global
 * CSS for it; the adapters render it with the overlay. Each reaction animates
 * for exactly `REACTION_LIFETIME_MS`, the lifetime the adapters remove it
 * after. When the system asks for reduced motion, a reaction does not move:
 * it stays where it appeared and only fades out.
 */
export const floatingReactionsStyles = [
  `@keyframes ${rise}{0%{transform:translateY(0);opacity:1}80%{opacity:1}100%{transform:translateY(-80%);opacity:0}}`,
  `@keyframes ${fade}{0%,80%{opacity:1}100%{opacity:0}}`,
  `${item}{animation:${rise} ${REACTION_LIFETIME_MS}ms ease-out forwards}`,
  `@media (prefers-reduced-motion:reduce){${item}{animation-name:${fade}}}`,
].join('\n')

/**
 * Accessible label node for the reaction — visually hidden so screen readers
 * read the emoji description once and don't repeat the decorative glyph.
 */
export const floatingReactionLabelClass = 'sr-only'
