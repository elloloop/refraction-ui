import * as React from 'react'
import {
  createNavbar,
  navbarVariants,
  navLinkVariants,
  type NavLink,
  type NavbarVariant,
} from '@elloloop/navbar'
import { cn } from '@elloloop/shared'

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Navigation links */
  links?: NavLink[]
  /** Current pathname for active state */
  currentPath?: string
  /** Visual variant */
  variant?: NavbarVariant
  /** Logo or brand slot */
  logo?: React.ReactNode
  /** Right-side actions slot */
  actions?: React.ReactNode
}

/**
 * Navbar component — renders a sticky header with navigation links.
 *
 * Uses the headless @elloloop/navbar core for state and ARIA attributes.
 * Hidden on mobile (links use md:flex).
 */
export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      links = [],
      currentPath,
      variant,
      logo,
      actions,
      className,
      ...props
    },
    ref,
  ) => {
    const api = createNavbar({ links, currentPath, variant })
    const classes = cn(navbarVariants({ variant }), className)

    return (
      <header ref={ref} className={classes} {...props}>
        <nav
          className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4"
          {...api.ariaProps}
        >
          {logo && <div className="flex-shrink-0">{logo}</div>}
          <ul className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={navLinkVariants({
                    active: api.isActive(link.href) ? 'true' : 'false',
                  })}
                  {...api.linkAriaProps(link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </nav>
      </header>
    )
  },
)

Navbar.displayName = 'Navbar'
