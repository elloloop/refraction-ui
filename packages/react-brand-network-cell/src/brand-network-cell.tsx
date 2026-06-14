import * as React from 'react'
import {
  createBrandNetworkCell,
  brandNetworkCellVariants,
  brandNetworkCellGlyphClass,
  brandNetworkCellDomainClass,
  brandNetworkCellCurrentBadgeClass,
  brandNetworkCellBodyClass,
  brandNetworkCellLinkClass,
} from '@refraction-ui/brand-network-cell'
import { cn } from '@refraction-ui/shared'

export interface BrandNetworkCellProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** Single character or short string used as the brand monogram. */
  glyph: string
  /** CSS colour value for the glyph box background (brand tint). Applied via inline style. */
  glyphBg?: string
  /** CSS colour value for the glyph text (brand tint). Applied via inline style. */
  glyphColor?: string
  /** Primary identifier shown below the glyph (product domain or name). */
  domain: string
  /** Supporting description text. */
  body: string
  /** When provided, renders a link at the bottom of the card. */
  href?: string
  /** Label for the link. Defaults to "Visit →". */
  linkLabel?: string
  /** Marks this cell as the current/active product in the network. */
  current?: boolean
}

/**
 * BrandNetworkCell — a card for surfacing related products in a brand network.
 *
 * Renders a glyph monogram (brand tint via inline style), the product domain,
 * a "You are here" badge when `current`, body copy, and an optional visit link.
 * The `current` variant adds `ring-1 ring-primary` to the card border.
 */
export const BrandNetworkCell = React.forwardRef<
  HTMLDivElement,
  BrandNetworkCellProps
>(
  (
    {
      glyph,
      glyphBg,
      glyphColor,
      domain,
      body,
      href,
      linkLabel,
      current = false,
      className,
      ...props
    },
    ref,
  ) => {
    const api = createBrandNetworkCell({ current })

    return (
      <div
        ref={ref}
        className={cn(
          brandNetworkCellVariants({ current: current ? 'true' : 'false' }),
          className,
        )}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {/* Glyph box — brand tint via inline style, never Tailwind classes */}
        <div
          className={brandNetworkCellGlyphClass}
          style={{ background: glyphBg, color: glyphColor }}
          aria-hidden="true"
        >
          {glyph}
        </div>

        {/* Domain row */}
        <div className="flex items-center gap-2">
          <span className={brandNetworkCellDomainClass}>{domain}</span>
          {current && (
            <span className={brandNetworkCellCurrentBadgeClass}>
              You are here
            </span>
          )}
        </div>

        {/* Body */}
        <p className={brandNetworkCellBodyClass}>{body}</p>

        {/* Optional link */}
        {href != null && (
          <a href={href} className={brandNetworkCellLinkClass}>
            {linkLabel ?? 'Visit →'}
          </a>
        )}
      </div>
    )
  },
)

BrandNetworkCell.displayName = 'BrandNetworkCell'
