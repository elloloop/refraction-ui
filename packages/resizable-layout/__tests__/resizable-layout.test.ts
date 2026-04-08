import { describe, it, expect } from 'vitest'
import { createResizableLayout } from '../src/resizable-layout.js'
import { resizableLayoutVariants, resizableDividerVariants } from '../src/resizable-layout.styles.js'

describe('createResizableLayout', () => {
  it('defaults to two equal panes', () => {
    const api = createResizableLayout()
    expect(api.sizes).toEqual([50, 50])
  })

  it('accepts custom default sizes', () => {
    const api = createResizableLayout({ defaultSizes: [30, 70] })
    expect(api.sizes).toEqual([30, 70])
  })

  it('accepts three panes', () => {
    const api = createResizableLayout({ defaultSizes: [25, 50, 25] })
    expect(api.sizes).toEqual([25, 50, 25])
  })

  it('defaults to horizontal orientation', () => {
    const api = createResizableLayout()
    expect(api.orientation).toBe('horizontal')
  })

  it('accepts vertical orientation', () => {
    const api = createResizableLayout({ orientation: 'vertical' })
    expect(api.orientation).toBe('vertical')
  })

  describe('resize operations', () => {
    it('resizes two panes by a positive delta', () => {
      const api = createResizableLayout({ defaultSizes: [50, 50] })
      api.startResize(0)
      api.onResize(10)
      expect(api.sizes[0]).toBe(60)
      expect(api.sizes[1]).toBe(40)
      api.endResize()
    })

    it('resizes two panes by a negative delta', () => {
      const api = createResizableLayout({ defaultSizes: [50, 50] })
      api.startResize(0)
      api.onResize(-20)
      expect(api.sizes[0]).toBe(30)
      expect(api.sizes[1]).toBe(70)
      api.endResize()
    })

    it('respects min size constraints', () => {
      const api = createResizableLayout({
        defaultSizes: [50, 50],
        minSizes: [20, 20],
      })
      api.startResize(0)
      api.onResize(-40) // try to shrink pane 0 to 10, below min of 20
      expect(api.sizes[0]).toBe(20)
      expect(api.sizes[1]).toBe(80)
      api.endResize()
    })

    it('respects max size constraints', () => {
      const api = createResizableLayout({
        defaultSizes: [50, 50],
        maxSizes: [70, 70],
      })
      api.startResize(0)
      api.onResize(30) // try to grow pane 0 to 80, above max of 70
      expect(api.sizes[0]).toBe(70)
      expect(api.sizes[1]).toBe(30)
      api.endResize()
    })

    it('respects min size on the adjacent pane', () => {
      const api = createResizableLayout({
        defaultSizes: [50, 50],
        minSizes: [0, 30],
      })
      api.startResize(0)
      api.onResize(30) // try to grow pane 0 to 80, shrinking pane 1 to 20 (below min 30)
      expect(api.sizes[1]).toBe(30)
      expect(api.sizes[0]).toBe(70)
      api.endResize()
    })

    it('no-ops when resize not started', () => {
      const api = createResizableLayout({ defaultSizes: [50, 50] })
      api.onResize(10)
      expect(api.sizes).toEqual([50, 50])
    })

    it('endResize resets and allows new resize', () => {
      const api = createResizableLayout({ defaultSizes: [50, 50] })
      api.startResize(0)
      api.onResize(10)
      api.endResize()
      // Sizes are now [60, 40]
      expect(api.sizes).toEqual([60, 40])

      // Start a new resize from current sizes
      api.startResize(0)
      api.onResize(5)
      expect(api.sizes[0]).toBe(65)
      expect(api.sizes[1]).toBe(35)
      api.endResize()
    })
  })

  describe('getCSSVariables', () => {
    it('generates CSS variables for each pane', () => {
      const api = createResizableLayout({ defaultSizes: [30, 70] })
      const vars = api.getCSSVariables()
      expect(vars['--rfr-pane-0-size']).toBe('30%')
      expect(vars['--rfr-pane-1-size']).toBe('70%')
    })

    it('reflects current sizes after resize', () => {
      const api = createResizableLayout({ defaultSizes: [50, 50] })
      api.startResize(0)
      api.onResize(15)
      api.endResize()

      const vars = api.getCSSVariables()
      expect(vars['--rfr-pane-0-size']).toBe('65%')
      expect(vars['--rfr-pane-1-size']).toBe('35%')
    })

    it('handles three panes', () => {
      const api = createResizableLayout({ defaultSizes: [33, 34, 33] })
      const vars = api.getCSSVariables()
      expect(Object.keys(vars)).toHaveLength(3)
      expect(vars['--rfr-pane-2-size']).toBe('33%')
    })
  })
})

describe('resizableLayoutVariants', () => {
  it('returns horizontal classes by default', () => {
    const classes = resizableLayoutVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-row')
  })

  it('returns vertical classes', () => {
    const classes = resizableLayoutVariants({ orientation: 'vertical' })
    expect(classes).toContain('flex-col')
  })
})

describe('resizableDividerVariants', () => {
  it('returns col-resize cursor for horizontal', () => {
    const classes = resizableDividerVariants({ orientation: 'horizontal' })
    expect(classes).toContain('cursor-col-resize')
  })

  it('returns row-resize cursor for vertical', () => {
    const classes = resizableDividerVariants({ orientation: 'vertical' })
    expect(classes).toContain('cursor-row-resize')
  })
})
