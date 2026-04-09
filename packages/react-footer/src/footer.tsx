import * as React from 'react'
import {
  createFooter,
  footerVariants,
  type FooterColumn,
  type SocialLink,
} from '@elloloop/footer'
import { cn } from '@elloloop/shared'

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Custom copyright text */
  copyright?: string
  /** Social media links */
  socialLinks?: SocialLink[]
  /** Footer link columns */
  columns?: FooterColumn[]
}

/**
 * Footer component — renders a site footer with copyright, social links, and link columns.
 *
 * Uses the headless @elloloop/footer core for state and ARIA attributes.
 */
export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      copyright,
      socialLinks = [],
      columns = [],
      className,
      ...props
    },
    ref,
  ) => {
    const api = createFooter({ copyright, socialLinks, columns })
    const classes = cn(footerVariants(), className)

    return (
      <footer ref={ref} className={classes} {...api.ariaProps} {...props}>
        <div className="mx-auto max-w-7xl px-4">
          {columns.length > 0 && (
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {columns.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-3 text-sm font-semibold">{column.title}</h3>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-8">
            <p className="text-sm text-muted-foreground">{api.copyrightText}</p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={link.label}
                  >
                    {link.icon ?? link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    )
  },
)

Footer.displayName = 'Footer'
