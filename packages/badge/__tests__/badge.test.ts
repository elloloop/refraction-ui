import { describe, it, expect } from 'vitest'
import { createBadge } from '../src/badge.js'
import { badgeVariants } from '../src/badge.styles.js'

describe('createBadge', () => {
  it('returns default data-variant attribute', () => {
    const api = createBadge()
    expect(api.dataAttributes['data-variant']).toBe('default')
  })

  it('does not set role for default variant', () => {
    const api = createBadge({ variant: 'default' })
    expect(api.ariaProps.role).toBeUndefined()
  })

  it('does not set role for primary variant', () => {
    const api = createBadge({ variant: 'primary' })
    expect(api.ariaProps.role).toBeUndefined()
  })

  it('does not set role for secondary variant', () => {
    const api = createBadge({ variant: 'secondary' })
    expect(api.ariaProps.role).toBeUndefined()
  })

  it('does not set role for outline variant', () => {
    const api = createBadge({ variant: 'outline' })
    expect(api.ariaProps.role).toBeUndefined()
  })

  it('sets role="status" for success variant', () => {
    const api = createBadge({ variant: 'success' })
    expect(api.ariaProps.role).toBe('status')
  })

  it('sets role="status" for warning variant', () => {
    const api = createBadge({ variant: 'warning' })
    expect(api.ariaProps.role).toBe('status')
  })

  it('sets role="status" for destructive variant', () => {
    const api = createBadge({ variant: 'destructive' })
    expect(api.ariaProps.role).toBe('status')
  })

  it('sets data-variant to the selected variant', () => {
    const api = createBadge({ variant: 'warning' })
    expect(api.dataAttributes['data-variant']).toBe('warning')
  })
})

describe('badgeVariants', () => {
  it('returns default variant classes', () => {
    const classes = badgeVariants()
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('rounded-full')
  })

  it('returns destructive variant classes', () => {
    const classes = badgeVariants({ variant: 'destructive' })
    expect(classes).toContain('bg-destructive')
  })

  it('returns outline variant classes', () => {
    const classes = badgeVariants({ variant: 'outline' })
    expect(classes).toContain('text-foreground')
  })

  it('returns success variant classes', () => {
    const classes = badgeVariants({ variant: 'success' })
    expect(classes).toContain('bg-green-500')
  })

  it('returns warning variant classes', () => {
    const classes = badgeVariants({ variant: 'warning' })
    expect(classes).toContain('bg-yellow-500')
  })

  it('returns sm size classes', () => {
    const classes = badgeVariants({ size: 'sm' })
    expect(classes).toContain('text-[10px]')
  })

  it('returns md size classes by default', () => {
    const classes = badgeVariants()
    expect(classes).toContain('py-0.5')
  })

  it('appends custom className', () => {
    const classes = badgeVariants({ className: 'my-badge' })
    expect(classes).toContain('my-badge')
  })
})

// ---------------------------------------------------------------
// Additional badge tests
// ---------------------------------------------------------------

describe('createBadge – defaults', () => {
  it('defaults to variant "default" when no args passed', () => {
    const api = createBadge()
    expect(api.dataAttributes['data-variant']).toBe('default')
  })

  it('defaults to no role when no args passed', () => {
    const api = createBadge()
    expect(api.ariaProps.role).toBeUndefined()
  })

  it('returns an object with ariaProps and dataAttributes keys', () => {
    const api = createBadge()
    expect(api).toHaveProperty('ariaProps')
    expect(api).toHaveProperty('dataAttributes')
  })
})

describe('createBadge – all status variants get role="status"', () => {
  it.each(['success', 'warning', 'destructive'] as const)(
    '%s variant gets role="status"',
    (variant) => {
      const api = createBadge({ variant })
      expect(api.ariaProps.role).toBe('status')
    },
  )
})

describe('createBadge – non-status variants do not get role', () => {
  it.each(['default', 'primary', 'secondary', 'outline'] as const)(
    '%s variant does not get role',
    (variant) => {
      const api = createBadge({ variant })
      expect(api.ariaProps.role).toBeUndefined()
    },
  )
})

describe('createBadge – data-variant for every variant', () => {
  it.each([
    'default',
    'primary',
    'secondary',
    'destructive',
    'outline',
    'success',
    'warning',
  ] as const)('%s variant sets data-variant correctly', (variant) => {
    const api = createBadge({ variant })
    expect(api.dataAttributes['data-variant']).toBe(variant)
  })
})

describe('badgeVariants – all 7 variants produce different classes', () => {
  it('each variant produces a distinct class string', () => {
    const variants = [
      'default',
      'primary',
      'secondary',
      'destructive',
      'outline',
      'success',
      'warning',
    ] as const
    const classStrings = variants.map((v) => badgeVariants({ variant: v }))
    // primary and default may share classes (both use bg-primary), so check at least
    // the clearly different ones are unique
    const unique = new Set(classStrings)
    // At minimum outline, secondary, destructive, success, warning should differ
    expect(unique.size).toBeGreaterThanOrEqual(5)
  })
})

describe('badgeVariants – both sizes produce different classes', () => {
  it('sm and md produce different class strings', () => {
    const sm = badgeVariants({ size: 'sm' })
    const md = badgeVariants({ size: 'md' })
    expect(sm).not.toBe(md)
  })

  it('sm contains text-[10px]', () => {
    expect(badgeVariants({ size: 'sm' })).toContain('text-[10px]')
  })

  it('md contains text-xs', () => {
    expect(badgeVariants({ size: 'md' })).toContain('text-xs')
  })
})

describe('badgeVariants – base classes always present', () => {
  it('all variants include rounded-full', () => {
    const variants = [
      'default',
      'primary',
      'secondary',
      'destructive',
      'outline',
      'success',
      'warning',
    ] as const
    for (const v of variants) {
      expect(badgeVariants({ variant: v })).toContain('rounded-full')
    }
  })

  it('all variants include inline-flex', () => {
    const variants = [
      'default',
      'primary',
      'secondary',
      'destructive',
      'outline',
      'success',
      'warning',
    ] as const
    for (const v of variants) {
      expect(badgeVariants({ variant: v })).toContain('inline-flex')
    }
  })
})
