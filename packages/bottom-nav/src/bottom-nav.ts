export interface NavTab {
  label: string
  href: string
  icon?: string
  activeIcon?: string
}

export interface BottomNavProps {
  tabs?: NavTab[]
  currentPath?: string
}

export interface BottomNavAPI {
  ariaProps: Record<string, string>
  isActive: (href: string) => boolean
  tabAriaProps: (href: string) => Record<string, string>
}

export function createBottomNav(props: BottomNavProps = {}): BottomNavAPI {
  const { currentPath = '/' } = props

  function isActive(href: string): boolean {
    if (href === '/') return currentPath === '/'
    return currentPath.startsWith(href)
  }

  return {
    ariaProps: { role: 'navigation', 'aria-label': 'Main navigation' },
    isActive,
    tabAriaProps: (href: string): Record<string, string> =>
      isActive(href) ? { 'aria-current': 'page' } : {},
  }
}
