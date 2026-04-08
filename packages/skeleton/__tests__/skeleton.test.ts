import { describe, it, expect } from 'vitest'
import { createSkeleton } from '../src/skeleton.js'
import { skeletonVariants } from '../src/skeleton.styles.js'

describe('createSkeleton', () => {
  it('returns aria-hidden true by default', () => {
    const api = createSkeleton()
    expect(api.ariaProps['aria-hidden']).toBe(true)
  })

  it('returns role presentation by default', () => {
    const api = createSkeleton()
    expect(api.ariaProps.role).toBe('presentation')
  })

  it('defaults shape to text', () => {
    const api = createSkeleton()
    expect(api.dataAttributes['data-shape']).toBe('text')
  })

  it('sets data-shape to circular', () => {
    const api = createSkeleton({ shape: 'circular' })
    expect(api.dataAttributes['data-shape']).toBe('circular')
  })

  it('sets data-shape to rectangular', () => {
    const api = createSkeleton({ shape: 'rectangular' })
    expect(api.dataAttributes['data-shape']).toBe('rectangular')
  })

  it('sets data-shape to rounded', () => {
    const api = createSkeleton({ shape: 'rounded' })
    expect(api.dataAttributes['data-shape']).toBe('rounded')
  })

  it('defaults animate to true', () => {
    const api = createSkeleton()
    expect(api.dataAttributes['data-animate']).toBe('true')
  })

  it('sets data-animate to false when animate is false', () => {
    const api = createSkeleton({ animate: false })
    expect(api.dataAttributes['data-animate']).toBe('false')
  })
})

describe('skeletonVariants', () => {
  it('returns base classes by default', () => {
    const classes = skeletonVariants()
    expect(classes).toContain('animate-pulse')
    expect(classes).toContain('bg-muted')
  })

  it('returns text shape classes by default', () => {
    const classes = skeletonVariants()
    expect(classes).toContain('h-4')
    expect(classes).toContain('w-full')
    expect(classes).toContain('rounded')
  })

  it('returns circular shape classes', () => {
    const classes = skeletonVariants({ shape: 'circular' })
    expect(classes).toContain('rounded-full')
  })

  it('returns rectangular shape classes', () => {
    const classes = skeletonVariants({ shape: 'rectangular' })
    expect(classes).toContain('rounded-none')
  })

  it('returns rounded shape classes', () => {
    const classes = skeletonVariants({ shape: 'rounded' })
    expect(classes).toContain('rounded-md')
  })

  it('appends custom className', () => {
    const classes = skeletonVariants({ className: 'my-skeleton' })
    expect(classes).toContain('my-skeleton')
  })
})

describe('createSkeleton extended', () => {
  it('all 4 shapes produce different data-shape values', () => {
    const shapes = ['text', 'circular', 'rectangular', 'rounded'] as const
    const dataShapes = shapes.map(
      (shape) => createSkeleton({ shape }).dataAttributes['data-shape'],
    )
    // Each is unique
    expect(new Set(dataShapes).size).toBe(4)
  })

  it('animate=false sets data-animate to false', () => {
    const api = createSkeleton({ animate: false })
    expect(api.dataAttributes['data-animate']).toBe('false')
  })

  it('default shape is text', () => {
    const api = createSkeleton()
    expect(api.dataAttributes['data-shape']).toBe('text')
  })

  it('width and height props are accepted without error', () => {
    const api = createSkeleton({ width: 200, height: 100 })
    // createSkeleton only returns ariaProps and dataAttributes;
    // width/height are a React-level concern, but the constructor should not throw
    expect(api.ariaProps['aria-hidden']).toBe(true)
  })

  it('lines prop for text shape is accepted without error', () => {
    const api = createSkeleton({ shape: 'text', lines: 5 })
    expect(api.dataAttributes['data-shape']).toBe('text')
  })
})

describe('skeletonVariants extended', () => {
  it('all 4 shapes produce different class strings', () => {
    const shapes = ['text', 'circular', 'rectangular', 'rounded'] as const
    const classStrings = shapes.map((shape) => skeletonVariants({ shape }))
    // At least some differ (circular vs rectangular vs rounded vs text)
    const unique = new Set(classStrings)
    expect(unique.size).toBe(4)
  })

  it('circular shape has rounded-full', () => {
    expect(skeletonVariants({ shape: 'circular' })).toContain('rounded-full')
  })

  it('rectangular shape has rounded-none', () => {
    expect(skeletonVariants({ shape: 'rectangular' })).toContain('rounded-none')
  })

  it('rounded shape has rounded-md', () => {
    expect(skeletonVariants({ shape: 'rounded' })).toContain('rounded-md')
  })

  it('text shape has base rounded class', () => {
    const classes = skeletonVariants({ shape: 'text' })
    expect(classes).toContain('rounded')
  })
})
