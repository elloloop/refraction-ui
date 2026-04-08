/**
 * Skip-to-content link utility.
 * Provides a keyboard-accessible link that is visually hidden until focused.
 */

/** Props for a skip-to-content link */
export interface SkipLinkProps {
  /** ID of the target element. Default: 'main-content' */
  targetId?: string
  /** Label text for the link. Default: 'Skip to main content' */
  label?: string
}

/** Create props for a skip-to-content link */
export function createSkipLink(props: SkipLinkProps = {}): {
  ariaProps: Record<string, string>
  href: string
  label: string
  /** CSS classes — visually hidden until focused */
  className: string
} {
  const targetId = props.targetId ?? 'main-content'
  const label = props.label ?? 'Skip to main content'

  return {
    ariaProps: {
      role: 'link',
      'aria-label': label,
    },
    href: `#${targetId}`,
    label,
    className:
      'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:underline',
  }
}
