import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const buttonTokens: TokenContract = {
  name: 'button',
  tokens: {
    bg: { variable: '--rfr-button-bg', fallback: 'hsl(var(--primary))' },
    fg: { variable: '--rfr-button-fg', fallback: 'hsl(var(--primary-foreground))' },
    border: { variable: '--rfr-button-border', fallback: 'hsl(var(--border))' },
    radius: { variable: '--rfr-button-radius', fallback: 'var(--radius)' },
    ring: { variable: '--rfr-button-ring', fallback: 'hsl(var(--ring))' },
  },
}

/**
 * Extends a button's hit area to at least 44×44 CSS px — the WCAG 2.5.5 target
 * size — with a transparent, centred pseudo-element. The button keeps its
 * visual size and takes up the same space in the layout; only the area that
 * receives pointer input grows. `max(44px, 2.75rem)` never drops below 44 CSS
 * px and grows with the reader's text-size setting.
 *
 * The button becomes the pseudo-element's containing block through a
 * zero-specificity `position: relative` (`:where()`), so a consumer's
 * `absolute`, `fixed` or `sticky` class still wins. An ancestor with
 * `overflow: hidden` clips the extension.
 *
 * Neighbouring targets that sit closer than 44px apart overlap, and the later
 * one in the document wins the overlap — leave at least 44px between their
 * centres (e.g. `gap-2` between 36px `icon` buttons).
 */
export const buttonTouchTargetStyles =
  "[:where(&)]:relative after:absolute after:left-1/2 after:top-1/2 after:h-full after:w-full after:min-h-[max(44px,2.75rem)] after:min-w-[max(44px,2.75rem)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"

export const buttonVariants = cva({
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      // Alias for `default` — see resolveButtonVariant + issue #201. Same classes
      // so styling stays identical even if a consumer reaches into `buttonVariants`
      // directly without going through resolveButtonVariant.
      primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      // Soft tinted brand fill — lower-emphasis primary action (issue #485).
      soft: 'bg-primary-soft text-primary-soft-foreground shadow-sm hover:bg-primary-soft/80',
      // Second brand accent (issue #485).
      tertiary: 'bg-tertiary text-tertiary-foreground shadow-sm hover:bg-tertiary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      xs: 'h-7 rounded px-2 text-xs',
      sm: 'h-8 rounded-md px-3 text-xs',
      default: 'h-9 rounded-md px-4 py-2 text-sm',
      lg: 'h-10 rounded-md px-8 text-sm',
      icon: 'h-9 w-9 rounded-md text-sm',
      'icon-sm': 'h-8 w-8 rounded-md text-xs',
      'icon-xs': 'h-7 w-7 rounded text-xs',
    },
    touchTarget: {
      true: buttonTouchTargetStyles,
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    touchTarget: 'false',
  },
})
