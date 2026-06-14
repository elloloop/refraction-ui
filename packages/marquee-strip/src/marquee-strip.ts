import type { AccessibilityProps } from '@refraction-ui/shared'

export interface MarqueeStripProps {
  /** Whether to continuously scroll the items. */
  scroll?: boolean
}

export interface MarqueeStripAPI {
  /** ARIA attributes to spread on the container element (`role="group"`). */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic container props for a marquee strip.
 *
 * Returns `role="group"` plus a `data-scroll` attribute. Adapters spread these
 * onto their container and render the label and items themselves. In scroll mode
 * the adapter is responsible for duplicating items once to achieve a seamless
 * loop (the CSS `marquee` keyframe translates from 0 to –50%).
 */
export function createMarqueeStrip(props: MarqueeStripProps = {}): MarqueeStripAPI {
  const { scroll = false } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'group',
  }

  const dataAttributes: Record<string, string> = {
    'data-scroll': String(scroll),
  }

  return { ariaProps, dataAttributes }
}
