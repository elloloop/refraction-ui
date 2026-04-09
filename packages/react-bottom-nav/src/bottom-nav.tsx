import * as React from 'react'
import {
  createBottomNav,
  bottomNavVariants,
  bottomNavTabVariants,
  type NavTab,
} from '@refraction-ui/bottom-nav'
import { cn } from '@refraction-ui/shared'

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Tab items */
  tabs?: NavTab[]
  /** Current pathname for active state */
  currentPath?: string
}

/**
 * BottomNav component — renders a fixed bottom navigation bar with tab buttons.
 *
 * Uses the headless @refraction-ui/bottom-nav core for state and ARIA attributes.
 * Visible on mobile only (md:hidden via styles).
 */
export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ tabs = [], currentPath, className, ...props }, ref) => {
    const api = createBottomNav({ tabs, currentPath })
    const classes = cn(bottomNavVariants(), className)

    return (
      <nav ref={ref} className={classes} {...api.ariaProps} {...props}>
        <div className="flex">
          {tabs.map((tab) => {
            const active = api.isActive(tab.href)
            return (
              <a
                key={tab.href}
                href={tab.href}
                className={bottomNavTabVariants({ active: active ? 'true' : 'false' })}
                {...api.tabAriaProps(tab.href)}
              >
                {tab.icon && <span aria-hidden="true">{active && tab.activeIcon ? tab.activeIcon : tab.icon}</span>}
                <span>{tab.label}</span>
              </a>
            )
          })}
        </div>
      </nav>
    )
  },
)

BottomNav.displayName = 'BottomNav'
