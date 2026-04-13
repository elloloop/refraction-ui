export interface NavLink {
  label: string
  href: string
  icon?: string
}

export type NavbarVariant = 'solid' | 'blur' | 'gradient' | 'transparent'

export interface NavbarProps {
  links?: NavLink[]
  currentPath?: string
  variant?: NavbarVariant
}

export interface NavbarAPI {
  ariaProps: Record<string, string>
  isActive: (href: string) => boolean
  linkAriaProps: (href: string) => Record<string, string>
}

export function createNavbar(props: NavbarProps = {}): NavbarAPI {
  const { currentPath = '/' } = props

  function isActive(href: string): boolean {
    if (href === '/') return currentPath === '/'
    return currentPath.startsWith(href)
  }

  function linkAriaProps(href: string): Record<string, string> {
    const active = isActive(href)
    return active ? { 'aria-current': 'page' } : {}
  }

  return {
    ariaProps: { role: 'navigation', 'aria-label': 'Main navigation' },
    isActive,
    linkAriaProps,
  }
}
