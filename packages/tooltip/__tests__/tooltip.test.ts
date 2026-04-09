import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTooltip } from '../src/tooltip.js'
import { tooltipContentVariants } from '../src/tooltip.styles.js'
import { resetIdCounter } from '@refraction-ui/shared'

beforeEach(() => {
  resetIdCounter()
})

describe('createTooltip', () => {
  it('defaults to closed state', () => {
    const api = createTooltip()
    expect(api.state.open).toBe(false)
  })

  it('respects defaultOpen', () => {
    const api = createTooltip({ defaultOpen: true })
    expect(api.state.open).toBe(true)
  })

  it('respects controlled open prop', () => {
    const api = createTooltip({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('defaults placement to top', () => {
    const api = createTooltip()
    expect(api.placement).toBe('top')
  })

  it('accepts custom placement', () => {
    const api = createTooltip({ placement: 'bottom' })
    expect(api.placement).toBe('bottom')
  })

  it('defaults delayDuration to 300', () => {
    const api = createTooltip()
    expect(api.delayDuration).toBe(300)
  })

  it('accepts custom delayDuration', () => {
    const api = createTooltip({ delayDuration: 500 })
    expect(api.delayDuration).toBe(500)
  })

  it('provides trigger props with aria-describedby', () => {
    const api = createTooltip()
    expect(api.triggerProps['aria-describedby']).toMatch(/^rfr-tooltip-/)
  })

  it('provides content props with role and id', () => {
    const api = createTooltip()
    expect(api.contentProps.role).toBe('tooltip')
    expect(api.contentProps.id).toMatch(/^rfr-tooltip-/)
  })

  it('trigger aria-describedby matches content id', () => {
    const api = createTooltip()
    expect(api.triggerProps['aria-describedby']).toBe(api.contentProps.id)
  })

  it('open() sets state to open and calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const api = createTooltip({ onOpenChange })
    api.open()
    expect(api.state.open).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('close() sets state to closed and calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const api = createTooltip({ defaultOpen: true, onOpenChange })
    api.close()
    expect(api.state.open).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('openWithDelay opens immediately when delayDuration is 0', () => {
    const onOpenChange = vi.fn()
    const api = createTooltip({ delayDuration: 0, onOpenChange })
    api.openWithDelay()
    expect(api.state.open).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('openWithDelay opens after delay', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const api = createTooltip({ delayDuration: 300, onOpenChange })
    api.openWithDelay()
    expect(api.state.open).toBe(false)
    vi.advanceTimersByTime(300)
    expect(api.state.open).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    vi.useRealTimers()
  })

  it('cancelDelay prevents delayed open', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const api = createTooltip({ delayDuration: 300, onOpenChange })
    api.openWithDelay()
    api.cancelDelay()
    vi.advanceTimersByTime(300)
    expect(api.state.open).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('close() cancels pending delay timer', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const api = createTooltip({ delayDuration: 300, onOpenChange })
    api.openWithDelay()
    api.close()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    vi.advanceTimersByTime(300)
    // Should not have been called with true after the close
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

describe('tooltipContentVariants', () => {
  it('returns base classes', () => {
    const classes = tooltipContentVariants()
    expect(classes).toContain('z-50')
    expect(classes).toContain('rounded-md')
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-xs')
  })

  it('appends custom className', () => {
    const classes = tooltipContentVariants({ className: 'my-tooltip' })
    expect(classes).toContain('my-tooltip')
  })
})

// ---------------------------------------------------------------
// Additional tooltip tests
// ---------------------------------------------------------------

describe('createTooltip – delay timer detailed behavior', () => {
  it('openWithDelay starts timer, cancelDelay cancels it', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const api = createTooltip({ delayDuration: 500, onOpenChange })
    api.openWithDelay()
    expect(api.state.open).toBe(false)

    api.cancelDelay()
    vi.advanceTimersByTime(500)
    expect(api.state.open).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('rapid open before delay completes replaces the timer', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const api = createTooltip({ delayDuration: 300, onOpenChange })

    api.openWithDelay()
    vi.advanceTimersByTime(100)
    // Call openWithDelay again — should reset the timer
    api.openWithDelay()
    vi.advanceTimersByTime(200)
    // Only 200ms since second openWithDelay, should not be open yet
    expect(api.state.open).toBe(false)

    vi.advanceTimersByTime(100)
    // Now 300ms since second openWithDelay
    expect(api.state.open).toBe(true)
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

describe('createTooltip – default delayDuration is 300', () => {
  it('returns 300 as delayDuration by default', () => {
    const api = createTooltip()
    expect(api.delayDuration).toBe(300)
  })
})

describe('createTooltip – custom delayDuration', () => {
  it('returns the custom delayDuration', () => {
    const api = createTooltip({ delayDuration: 1000 })
    expect(api.delayDuration).toBe(1000)
  })

  it('delayDuration=0 makes openWithDelay open immediately', () => {
    const api = createTooltip({ delayDuration: 0 })
    api.openWithDelay()
    expect(api.state.open).toBe(true)
  })
})

describe('createTooltip – all 4 placements', () => {
  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'placement "%s" is stored correctly',
    (placement) => {
      const api = createTooltip({ placement })
      expect(api.placement).toBe(placement)
    },
  )
})

describe('createTooltip – controlled open prop', () => {
  it('open=true sets state.open to true', () => {
    const api = createTooltip({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('open=false sets state.open to false', () => {
    const api = createTooltip({ open: false })
    expect(api.state.open).toBe(false)
  })
})

describe('createTooltip – multiple tooltips generate unique IDs', () => {
  it('three tooltips have three distinct content IDs', () => {
    const api1 = createTooltip()
    const api2 = createTooltip()
    const api3 = createTooltip()
    const ids = [api1.contentProps.id, api2.contentProps.id, api3.contentProps.id]
    expect(new Set(ids).size).toBe(3)
  })
})

describe('createTooltip – aria-describedby links to content id', () => {
  it('trigger aria-describedby matches contentProps.id', () => {
    const api = createTooltip()
    expect(api.triggerProps['aria-describedby']).toBe(api.contentProps.id)
  })

  it('each tooltip has its own linked pair', () => {
    const api1 = createTooltip()
    const api2 = createTooltip()
    expect(api1.triggerProps['aria-describedby']).toBe(api1.contentProps.id)
    expect(api2.triggerProps['aria-describedby']).toBe(api2.contentProps.id)
    expect(api1.contentProps.id).not.toBe(api2.contentProps.id)
  })
})

describe('createTooltip – contentProps.role is "tooltip"', () => {
  it('role is always "tooltip"', () => {
    const api = createTooltip()
    expect(api.contentProps.role).toBe('tooltip')
  })
})

describe('tooltipContentVariants – side variants', () => {
  it.each([
    ['top', 'animate-slide-down-fade'],
    ['bottom', 'animate-slide-up-fade'],
    ['left', 'animate-slide-right-fade'],
    ['right', 'animate-slide-left-fade'],
  ] as const)('side "%s" produces class "%s"', (side, expected) => {
    const classes = tooltipContentVariants({ side })
    expect(classes).toContain(expected)
  })
})
