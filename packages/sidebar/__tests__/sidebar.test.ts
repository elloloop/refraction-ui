import { describe, it, expect } from 'vitest'
import { createSidebar } from '../src/sidebar.js'
import { sidebarVariants, sidebarItemVariants } from '../src/sidebar.styles.js'

const sections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Users', href: '/admin/users', roles: ['admin'] },
    ],
  },
]

describe('createSidebar', () => {
  it('provides sidebar ARIA', () => {
    const api = createSidebar()
    expect(api.ariaProps.role).toBe('navigation')
    expect(api.ariaProps['aria-label']).toBe('Sidebar')
  })

  it('detects active item', () => {
    const api = createSidebar({ currentPath: '/dashboard', sections })
    expect(api.isActive('/dashboard')).toBe(true)
    expect(api.isActive('/settings')).toBe(false)
  })

  it('filters items by user roles', () => {
    const noRoles = createSidebar({ sections, userRoles: [] })
    expect(noRoles.visibleSections).toHaveLength(1) // only Main

    const withAdmin = createSidebar({ sections, userRoles: ['admin'] })
    expect(withAdmin.visibleSections).toHaveLength(2) // Main + Admin
  })

  it('shows items without role restrictions to everyone', () => {
    const api = createSidebar({ sections, userRoles: [] })
    expect(api.isVisible({ label: 'Test', href: '/test' })).toBe(true)
  })

  it('hides items when user lacks required role', () => {
    const api = createSidebar({ sections, userRoles: ['student'] })
    expect(api.isVisible({ label: 'Admin', href: '/admin', roles: ['admin'] })).toBe(false)
  })

  it('returns aria-current for active item', () => {
    const api = createSidebar({ currentPath: '/dashboard', sections })
    expect(api.itemAriaProps('/dashboard')).toEqual({ 'aria-current': 'page' })
  })
})

// ── Additional tests ──

describe('createSidebar - multiple roles', () => {
  const roleSections = [
    {
      title: 'General',
      items: [{ label: 'Home', href: '/home' }],
    },
    {
      title: 'Editor',
      items: [{ label: 'Edit', href: '/edit', roles: ['editor'] }],
    },
    {
      title: 'Admin',
      items: [{ label: 'Users', href: '/users', roles: ['admin'] }],
    },
    {
      title: 'Multi-role',
      items: [{ label: 'Reports', href: '/reports', roles: ['admin', 'editor'] }],
    },
  ]

  it('filters correctly for multiple user roles', () => {
    const api = createSidebar({ sections: roleSections, userRoles: ['admin', 'editor'] })
    expect(api.visibleSections).toHaveLength(4) // all 4 sections visible
  })

  it('shows items requiring any of the user roles (OR logic)', () => {
    const api = createSidebar({ sections: roleSections, userRoles: ['editor'] })
    // General (no roles), Editor (editor), Multi-role (has editor) = 3
    expect(api.visibleSections).toHaveLength(3)
  })

  it('shows only unrestricted items for empty roles', () => {
    const api = createSidebar({ sections: roleSections, userRoles: [] })
    expect(api.visibleSections).toHaveLength(1) // only General
  })
})

describe('createSidebar - nested items (children)', () => {
  it('items can have children property', () => {
    const nestedSections = [
      {
        title: 'Nav',
        items: [
          {
            label: 'Settings',
            href: '/settings',
            children: [
              { label: 'Profile', href: '/settings/profile' },
              { label: 'Security', href: '/settings/security' },
            ],
          },
        ],
      },
    ]
    const api = createSidebar({ sections: nestedSections, currentPath: '/settings/profile' })
    expect(api.visibleSections).toHaveLength(1)
    expect(api.visibleSections[0].items[0].children).toHaveLength(2)
  })

  it('isActive matches nested child paths', () => {
    const api = createSidebar({ currentPath: '/settings/profile' })
    expect(api.isActive('/settings')).toBe(true)
    expect(api.isActive('/settings/profile')).toBe(true)
  })
})

describe('createSidebar - empty sections filtered', () => {
  it('filters out sections where all items are hidden by roles', () => {
    const restrictedSections = [
      {
        title: 'Admin Only',
        items: [{ label: 'Admin Panel', href: '/admin', roles: ['admin'] }],
      },
      {
        title: 'Public',
        items: [{ label: 'Home', href: '/home' }],
      },
    ]
    const api = createSidebar({ sections: restrictedSections, userRoles: [] })
    expect(api.visibleSections).toHaveLength(1)
    expect(api.visibleSections[0].title).toBe('Public')
  })

  it('all sections hidden when no items are visible', () => {
    const allRestricted = [
      {
        title: 'Admin',
        items: [{ label: 'A', href: '/a', roles: ['admin'] }],
      },
      {
        title: 'Editor',
        items: [{ label: 'B', href: '/b', roles: ['editor'] }],
      },
    ]
    const api = createSidebar({ sections: allRestricted, userRoles: [] })
    expect(api.visibleSections).toHaveLength(0)
  })
})

describe('createSidebar - collapsed prop', () => {
  it('accepts collapsed prop without error', () => {
    const api = createSidebar({ collapsed: true })
    expect(api.ariaProps.role).toBe('navigation')
  })

  it('works with collapsed=false', () => {
    const api = createSidebar({ collapsed: false, sections })
    expect(api.visibleSections.length).toBeGreaterThanOrEqual(0)
  })
})

describe('createSidebar - path matching edge cases', () => {
  it('root "/" only matches exact "/"', () => {
    const api = createSidebar({ currentPath: '/' })
    expect(api.isActive('/')).toBe(true)
    expect(api.isActive('/dashboard')).toBe(false)
  })

  it('itemAriaProps returns empty for inactive path', () => {
    const api = createSidebar({ currentPath: '/dashboard' })
    expect(api.itemAriaProps('/settings')).toEqual({})
  })

  it('defaults currentPath to "/"', () => {
    const api = createSidebar()
    expect(api.isActive('/')).toBe(true)
  })

  it('defaults sections to empty', () => {
    const api = createSidebar()
    expect(api.visibleSections).toEqual([])
  })
})

describe('sidebarVariants', () => {
  it('collapsed true produces narrow width', () => {
    const classes = sidebarVariants({ collapsed: 'true' })
    expect(classes).toContain('w-16')
  })

  it('collapsed false produces wide width', () => {
    const classes = sidebarVariants({ collapsed: 'false' })
    expect(classes).toContain('w-64')
  })

  it('default is expanded (w-64)', () => {
    const classes = sidebarVariants()
    expect(classes).toContain('w-64')
  })

  it('includes border-r base class', () => {
    expect(sidebarVariants()).toContain('border-r')
  })
})

describe('sidebarItemVariants', () => {
  it('active item has bg-accent', () => {
    expect(sidebarItemVariants({ active: 'true' })).toContain('bg-accent')
  })

  it('inactive item has hover:bg-muted', () => {
    expect(sidebarItemVariants({ active: 'false' })).toContain('hover:bg-muted')
  })

  it('default is inactive', () => {
    expect(sidebarItemVariants()).toContain('text-muted-foreground')
  })

  it('base includes rounded-md', () => {
    expect(sidebarItemVariants()).toContain('rounded-md')
  })
})
