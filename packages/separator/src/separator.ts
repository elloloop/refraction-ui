import type { AccessibilityProps } from '@refraction-ui/shared'

export type SeparatorOrientation = 'horizontal' | 'vertical'

export interface SeparatorProps {
  /** Orientation of the separator. Defaults to `'horizontal'`. */
  orientation?: SeparatorOrientation
  /**
   * When `true` (the default) the separator is purely visual and is hidden
   * from assistive tech (`role="none"`). When `false` it is exposed as a
   * semantic `role="separator"` with the appropriate `aria-orientation`.
   */
  decorative?: boolean
}

/**
 * ARIA attributes for a separator. Extends the shared base with
 * `aria-orientation`, which is specific to the `separator` role.
 */
export interface SeparatorAriaProps extends Partial<AccessibilityProps> {
  'aria-orientation'?: SeparatorOrientation
}

export interface SeparatorAPI {
  /** ARIA attributes to spread on the element. */
  ariaProps: SeparatorAriaProps
  /** Data attributes for CSS styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Headless separator core — computes ARIA semantics and data attributes for
 * a separator rule. JSX-free so it can be shared across framework adapters.
 *
 * Per ARIA, a decorative separator must not be announced (`role="none"`),
 * while a semantic one exposes `role="separator"` and `aria-orientation`.
 */
export function createSeparator(props: SeparatorProps = {}): SeparatorAPI {
  const { orientation = 'horizontal', decorative = true } = props

  const ariaProps: SeparatorAriaProps = decorative
    ? { role: 'none' }
    : { role: 'separator', 'aria-orientation': orientation }

  const dataAttributes: Record<string, string> = {
    'data-orientation': orientation,
  }

  return {
    ariaProps,
    dataAttributes,
  }
}
