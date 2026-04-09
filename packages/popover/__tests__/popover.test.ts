import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPopover } from '../src/popover.js'
import { popoverContentVariants } from '../src/popover.styles.js'
import { resetIdCounter } from '@elloloop/shared'

beforeEach(() => {
  resetIdCounter()
})

describe('createPopover', () => {
  it('defaults to closed state', () => {
    const api = createPopover()
    expect(api.state.open).toBe(false)
  })

  it('respects defaultOpen', () => {
    const api = createPopover({ defaultOpen: true })
    expect(api.state.open).toBe(true)
  })

  it('respects controlled open prop', () => {
    const api = createPopover({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('defaults placement to bottom', () => {
    const api = createPopover()
    expect(api.placement).toBe('bottom')
  })

  it('accepts custom placement', () => {
    const api = createPopover({ placement: 'top' })
    expect(api.placement).toBe('top')
  })

  it('provides trigger props with aria-expanded, aria-controls, aria-haspopup', () => {
    const api = createPopover()
    expect(api.triggerProps['aria-expanded']).toBe(false)
    expect(api.triggerProps['aria-controls']).toMatch(/^rfr-popover-/)
    expect(api.triggerProps['aria-haspopup']).toBe('dialog')
  })

  it('provides content props with role and id', () => {
    const api = createPopover()
    expect(api.contentProps.role).toBe('dialog')
    expect(api.contentProps.id).toMatch(/^rfr-popover-/)
  })

  it('trigger aria-controls matches content id', () => {
    const api = createPopover()
    expect(api.triggerProps['aria-controls']).toBe(api.contentProps.id)
  })

  it('open() sets state to open and calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const api = createPopover({ onOpenChange })
    api.open()
    expect(api.state.open).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('close() sets state to closed and calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const api = createPopover({ defaultOpen: true, onOpenChange })
    api.close()
    expect(api.state.open).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('toggle() flips the state', () => {
    const api = createPopover()
    api.toggle()
    expect(api.state.open).toBe(true)
    api.toggle()
    expect(api.state.open).toBe(false)
  })

  it('has Escape keyboard handler', () => {
    const api = createPopover()
    expect(api.keyboardHandlers['Escape']).toBeDefined()
  })

  it('Escape handler closes the popover', () => {
    const onOpenChange = vi.fn()
    const api = createPopover({ defaultOpen: true, onOpenChange })
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    expect(api.state.open).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('provides handleKeyDown function', () => {
    const api = createPopover()
    expect(typeof api.handleKeyDown).toBe('function')
  })
})

describe('popoverContentVariants', () => {
  it('returns base classes', () => {
    const classes = popoverContentVariants()
    expect(classes).toContain('z-50')
    expect(classes).toContain('w-72')
    expect(classes).toContain('rounded-md')
  })

  it('appends custom className', () => {
    const classes = popoverContentVariants({ className: 'my-popover' })
    expect(classes).toContain('my-popover')
  })
})

// ---------------------------------------------------------------
// Additional popover tests
// ---------------------------------------------------------------

describe('createPopover – all 4 placements stored correctly', () => {
  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'placement "%s" is stored on api.placement',
    (placement) => {
      const api = createPopover({ placement })
      expect(api.placement).toBe(placement)
    },
  )
})

describe('createPopover – default placement', () => {
  it('defaults to "bottom" when no placement provided', () => {
    const api = createPopover()
    expect(api.placement).toBe('bottom')
  })
})

describe('createPopover – controlled open prop', () => {
  it('open=true makes state.open true', () => {
    const api = createPopover({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('open=false makes state.open false', () => {
    const api = createPopover({ open: false })
    expect(api.state.open).toBe(false)
  })
})

describe('createPopover – unique IDs', () => {
  it('multiple createPopover calls generate unique content IDs', () => {
    const api1 = createPopover()
    const api2 = createPopover()
    const api3 = createPopover()
    const ids = [api1.contentProps.id, api2.contentProps.id, api3.contentProps.id]
    expect(new Set(ids).size).toBe(3)
  })

  it('each popover trigger aria-controls matches its own content id', () => {
    const api1 = createPopover()
    const api2 = createPopover()
    expect(api1.triggerProps['aria-controls']).toBe(api1.contentProps.id)
    expect(api2.triggerProps['aria-controls']).toBe(api2.contentProps.id)
    expect(api1.contentProps.id).not.toBe(api2.contentProps.id)
  })
})

describe('createPopover – close on closed is no-op', () => {
  it('close() on already-closed popover does not throw', () => {
    const onOpenChange = vi.fn()
    const api = createPopover({ onOpenChange })
    expect(api.state.open).toBe(false)
    api.close()
    // It still calls onOpenChange(false) — the no-op is that state stays false
    expect(api.state.open).toBe(false)
  })
})

describe('createPopover – open on already-open is no-op', () => {
  it('open() on already-open popover keeps state open', () => {
    const onOpenChange = vi.fn()
    const api = createPopover({ defaultOpen: true, onOpenChange })
    expect(api.state.open).toBe(true)
    api.open()
    expect(api.state.open).toBe(true)
  })
})

describe('createPopover – toggle works both directions', () => {
  it('toggles from closed to open', () => {
    const api = createPopover()
    expect(api.state.open).toBe(false)
    api.toggle()
    expect(api.state.open).toBe(true)
  })

  it('toggles from open to closed', () => {
    const api = createPopover({ defaultOpen: true })
    expect(api.state.open).toBe(true)
    api.toggle()
    expect(api.state.open).toBe(false)
  })

  it('double toggle returns to original state', () => {
    const api = createPopover()
    api.toggle()
    api.toggle()
    expect(api.state.open).toBe(false)
  })
})

describe('createPopover – content id matches trigger aria-controls', () => {
  it('trigger aria-controls is the same as contentProps.id', () => {
    const api = createPopover()
    expect(api.triggerProps['aria-controls']).toBe(api.contentProps.id)
  })
})

describe('popoverContentVariants – side variants', () => {
  it.each([
    ['top', 'animate-slide-down-fade'],
    ['bottom', 'animate-slide-up-fade'],
    ['left', 'animate-slide-right-fade'],
    ['right', 'animate-slide-left-fade'],
  ] as const)('side "%s" produces class "%s"', (side, expected) => {
    const classes = popoverContentVariants({ side })
    expect(classes).toContain(expected)
  })
})
