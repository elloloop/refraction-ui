import * as React from 'react'
import {
  createSidebar,
  sidebarVariants,
  sidebarItemVariants,
  type SidebarSection,
  type SidebarItem as SidebarItemType,
} from '@elloloop/sidebar'
import { cn } from '@elloloop/shared'

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Sidebar sections with items */
  sections?: SidebarSection[]
  /** Current pathname for active state */
  currentPath?: string
  /** Whether the sidebar is collapsed */
  collapsed?: boolean
  /** User roles for visibility filtering */
  userRoles?: string[]
}

/**
 * Sidebar component — renders a vertical navigation panel with sections and items.
 *
 * Uses the headless @elloloop/sidebar core for state, visibility, and ARIA attributes.
 * Hidden on mobile (hidden md:flex via styles).
 */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      sections = [],
      currentPath,
      collapsed = false,
      userRoles,
      className,
      ...props
    },
    ref,
  ) => {
    const api = createSidebar({ sections, currentPath, collapsed, userRoles })
    const classes = cn(
      sidebarVariants({ collapsed: collapsed ? 'true' : 'false' }),
      className,
    )

    return (
      <aside ref={ref} className={classes} {...api.ariaProps} {...props}>
        <div className="flex flex-col gap-4 p-4">
          {api.visibleSections.map((section, sIdx) => (
            <div key={section.title ?? sIdx}>
              {section.title && !collapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = api.isActive(item.href)
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={sidebarItemVariants({
                          active: active ? 'true' : 'false',
                        })}
                        {...api.itemAriaProps(item.href)}
                      >
                        {item.icon && <span aria-hidden="true">{item.icon}</span>}
                        {!collapsed && <span>{item.label}</span>}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    )
  },
)

Sidebar.displayName = 'Sidebar'
