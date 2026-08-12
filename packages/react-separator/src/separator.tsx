import * as React from 'react'
import {
  createSeparator,
  separatorVariants,
  separatorLineClass,
  separatorSubtleLineClass,
  separatorLabelClass,
  type SeparatorOrientation,
  type SeparatorTone,
} from '@refraction-ui/separator'
import { cn } from '@refraction-ui/shared'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the separator. Defaults to `'horizontal'`. */
  orientation?: SeparatorOrientation
  /**
   * Line tone. `'default'` uses the standard border token; `'subtle'` uses the
   * hairline `border-subtle` token for a lighter rule (issue #485).
   */
  tone?: SeparatorTone
  /**
   * Optional centered label. Only meaningful for horizontal separators —
   * renders a line on each side of the label (a "labeled divider").
   */
  label?: React.ReactNode
  /**
   * When `true` (the default) the separator is purely visual and is hidden
   * from assistive tech (`role="none"`). When `false` it is exposed as a
   * semantic `role="separator"` with the appropriate `aria-orientation`.
   */
  decorative?: boolean
}

/**
 * Separator / LabeledDivider — a thin rule that visually divides content.
 *
 * Supports horizontal and vertical orientations and an optional centered
 * label (the "labeled divider" variant, horizontal only). State and ARIA
 * semantics come from the headless @refraction-ui/separator core; styling
 * via Tailwind utility classes (no external CSS-in-JS).
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    {
      orientation = 'horizontal',
      tone = 'default',
      label,
      decorative = true,
      className,
      ...props
    },
    ref,
  ) {
    // Labeled divider — decorative chrome wrapping a centered label.
    if (orientation === 'horizontal' && label != null) {
      const lineClass = tone === 'subtle' ? separatorSubtleLineClass : separatorLineClass
      return (
        <div
          ref={ref}
          role="none"
          className={cn(separatorVariants({ labeled: 'true', tone }), className)}
          {...props}
        >
          <span className={lineClass} />
          <span className={separatorLabelClass}>{label}</span>
          <span className={lineClass} />
        </div>
      )
    }

    const { ariaProps, dataAttributes } = createSeparator({
      orientation,
      decorative,
    })

    return (
      <div
        ref={ref}
        className={cn(separatorVariants({ orientation, tone }), className)}
        {...ariaProps}
        {...dataAttributes}
        {...props}
      />
    )
  },
)
