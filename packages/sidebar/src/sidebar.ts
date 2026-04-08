export interface SidebarItem {
  label: string
  href: string
  icon?: string
  /** Roles required to see this item */
  roles?: string[]
  /** Nested items */
  children?: SidebarItem[]
}

export interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

export interface SidebarProps {
  sections?: SidebarSection[]
  currentPath?: string
  collapsed?: boolean
  userRoles?: string[]
}

export interface SidebarAPI {
  ariaProps: Record<string, string>
  isActive: (href: string) => boolean
  isVisible: (item: SidebarItem) => boolean
  itemAriaProps: (href: string) => Record<string, string>
  visibleSections: SidebarSection[]
}

export function createSidebar(props: SidebarProps = {}): SidebarAPI {
  const { sections = [], currentPath = '/', userRoles = [] } = props

  function isActive(href: string): boolean {
    if (href === '/') return currentPath === '/'
    return currentPath.startsWith(href)
  }

  function isVisible(item: SidebarItem): boolean {
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.some((role) => userRoles.includes(role))
  }

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(isVisible),
    }))
    .filter((section) => section.items.length > 0)

  return {
    ariaProps: { role: 'navigation', 'aria-label': 'Sidebar' },
    isActive,
    isVisible,
    itemAriaProps: (href: string): Record<string, string> =>
      isActive(href) ? { 'aria-current': 'page' } : {},
    visibleSections,
  }
}
