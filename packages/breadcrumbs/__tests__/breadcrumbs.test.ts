import { describe, it, expect } from 'vitest'
import { createBreadcrumbs } from '../src/breadcrumbs.js'
import {
  breadcrumbsVariants,
  breadcrumbItemVariants,
  breadcrumbSeparatorStyles,
} from '../src/breadcrumbs.styles.js'

describe('createBreadcrumbs', () => {
  it('provides breadcrumb ARIA label', () => {
    const api = createBreadcrumbs()
    expect(api.ariaProps['aria-label']).toBe('Breadcrumb')
  })

  it('auto-generates items from pathname', () => {
    const api = createBreadcrumbs({ pathname: '/products/widgets' })
    expect(api.items).toHaveLength(3)
    expect(api.items[0].label).toBe('Home')
    expect(api.items[1].label).toBe('Products')
    expect(api.items[2].label).toBe('Widgets')
  })

  it('converts kebab-case to Title Case', () => {
    const api = createBreadcrumbs({ pathname: '/my-cool-page' })
    expect(api.items[1].label).toBe('My Cool Page')
  })

  it('uses custom label map', () => {
    const api = createBreadcrumbs({
      pathname: '/docs/api',
      labels: { docs: 'Documentation', api: 'API Reference' },
    })
    expect(api.items[1].label).toBe('Documentation')
    expect(api.items[2].label).toBe('API Reference')
  })

  it('uses manual items when provided', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Custom', href: '/custom' },
    ]
    const api = createBreadcrumbs({ items })
    expect(api.items).toEqual(items)
  })

  it('marks last item as current page', () => {
    const api = createBreadcrumbs({ pathname: '/a/b' })
    expect(api.isLast(2)).toBe(true)
    expect(api.isLast(0)).toBe(false)
    expect(api.itemAriaProps(2)).toEqual({ 'aria-current': 'page' })
    expect(api.itemAriaProps(0)).toEqual({})
  })

  it('truncates with ellipsis when maxItems exceeded', () => {
    const api = createBreadcrumbs({ pathname: '/a/b/c/d/e', maxItems: 3 })
    expect(api.items.length).toBeLessThanOrEqual(4) // first + ... + last 2
    expect(api.items[1].label).toBe('...')
  })

  it('uses default separator', () => {
    const api = createBreadcrumbs()
    expect(api.separator).toBe('/')
  })

  it('uses custom separator', () => {
    const api = createBreadcrumbs({ separator: '>' })
    expect(api.separator).toBe('>')
  })
})

// ── Additional tests ──

describe('createBreadcrumbs - edge cases', () => {
  it('root pathname "/" produces only Home item', () => {
    const api = createBreadcrumbs({ pathname: '/' })
    expect(api.items).toHaveLength(1)
    expect(api.items[0].label).toBe('Home')
    expect(api.items[0].href).toBe('/')
  })

  it('deep path produces correct number of items', () => {
    const api = createBreadcrumbs({ pathname: '/a/b/c/d/e' })
    // Home + 5 segments = 6
    expect(api.items).toHaveLength(6)
    expect(api.items[0].label).toBe('Home')
    expect(api.items[5].label).toBe('E')
  })

  it('deep path produces correct hrefs', () => {
    const api = createBreadcrumbs({ pathname: '/docs/api/v2' })
    expect(api.items[0].href).toBe('/')
    expect(api.items[1].href).toBe('/docs')
    expect(api.items[2].href).toBe('/docs/api')
    expect(api.items[3].href).toBe('/docs/api/v2')
  })

  it('labels override works for path segments by segment name', () => {
    const api = createBreadcrumbs({
      pathname: '/settings/profile',
      labels: { settings: 'Preferences', profile: 'My Profile' },
    })
    expect(api.items[1].label).toBe('Preferences')
    expect(api.items[2].label).toBe('My Profile')
  })

  it('labels override works for full path keys', () => {
    const api = createBreadcrumbs({
      pathname: '/docs/api',
      labels: { '/docs/api': 'Full API Docs' },
    })
    expect(api.items[2].label).toBe('Full API Docs')
  })

  it('maxItems=2 truncates with ellipsis', () => {
    const api = createBreadcrumbs({ pathname: '/a/b/c', maxItems: 2 })
    // Should be: Home, ..., C (first + ellipsis + last 1)
    expect(api.items[0].label).toBe('Home')
    expect(api.items[1].label).toBe('...')
    expect(api.items[api.items.length - 1].label).toBe('C')
  })

  it('maxItems equal to items length does not truncate', () => {
    const api = createBreadcrumbs({ pathname: '/a/b', maxItems: 3 })
    // Home + A + B = 3, same as maxItems
    expect(api.items).toHaveLength(3)
    expect(api.items.find((i) => i.label === '...')).toBeUndefined()
  })

  it('maxItems greater than items length does not truncate', () => {
    const api = createBreadcrumbs({ pathname: '/a', maxItems: 10 })
    expect(api.items).toHaveLength(2)
    expect(api.items.find((i) => i.label === '...')).toBeUndefined()
  })

  it('no pathname and no items produces empty items array', () => {
    const api = createBreadcrumbs()
    expect(api.items).toEqual([])
  })

  it('empty pathname string produces empty items (falsy)', () => {
    const api = createBreadcrumbs({ pathname: '' })
    // '' is falsy so no items generated
    expect(api.items).toHaveLength(0)
  })

  it('isLast returns true only for the very last index', () => {
    const api = createBreadcrumbs({ pathname: '/a/b/c' })
    expect(api.isLast(0)).toBe(false)
    expect(api.isLast(1)).toBe(false)
    expect(api.isLast(2)).toBe(false)
    expect(api.isLast(3)).toBe(true) // index 3 = last of 4 items
  })

  it('itemAriaProps returns aria-current only for last', () => {
    const api = createBreadcrumbs({ pathname: '/x/y' })
    expect(api.itemAriaProps(0)).toEqual({})
    expect(api.itemAriaProps(1)).toEqual({})
    expect(api.itemAriaProps(2)).toEqual({ 'aria-current': 'page' })
  })
})

describe('breadcrumbsVariants', () => {
  it('includes flex and items-center base classes', () => {
    const classes = breadcrumbsVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
  })

  it('includes text-sm', () => {
    expect(breadcrumbsVariants()).toContain('text-sm')
  })
})

describe('breadcrumbItemVariants', () => {
  it('active item has font-medium', () => {
    expect(breadcrumbItemVariants({ active: 'true' })).toContain('font-medium')
  })

  it('inactive item has hover style', () => {
    expect(breadcrumbItemVariants({ active: 'false' })).toContain('hover:text-foreground')
  })

  it('default is inactive', () => {
    expect(breadcrumbItemVariants()).toContain('hover:text-foreground')
  })

  it('base includes transition-colors', () => {
    expect(breadcrumbItemVariants()).toContain('transition-colors')
  })
})

describe('breadcrumbSeparatorStyles', () => {
  it('contains select-none', () => {
    expect(breadcrumbSeparatorStyles).toContain('select-none')
  })
})
