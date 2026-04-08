import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createCollapsible } from '../src/collapsible.js'
import { collapsibleContentVariants } from '../src/collapsible.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createCollapsible', () => {
  it('defaults to closed state', () => {
    const api = createCollapsible()
    expect(api.state.open).toBe(false)
  })

  it('respects defaultOpen', () => {
    const api = createCollapsible({ defaultOpen: true })
    expect(api.state.open).toBe(true)
  })

  it('respects controlled open prop', () => {
    const api = createCollapsible({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('trigger has aria-expanded matching open state', () => {
    const api = createCollapsible()
    expect(api.triggerProps['aria-expanded']).toBe(false)
  })

  it('trigger has aria-expanded true when open', () => {
    const api = createCollapsible({ defaultOpen: true })
    expect(api.triggerProps['aria-expanded']).toBe(true)
  })

  it('trigger has aria-controls pointing to content id', () => {
    const api = createCollapsible()
    expect(api.triggerProps['aria-controls']).toBe(api.contentProps.id)
  })

  it('trigger has data-state closed by default', () => {
    const api = createCollapsible()
    expect(api.triggerProps['data-state']).toBe('closed')
  })

  it('trigger has data-state open when open', () => {
    const api = createCollapsible({ defaultOpen: true })
    expect(api.triggerProps['data-state']).toBe('open')
  })

  it('trigger has data-disabled undefined when not disabled', () => {
    const api = createCollapsible()
    expect(api.triggerProps['data-disabled']).toBeUndefined()
  })

  it('trigger has data-disabled empty string when disabled', () => {
    const api = createCollapsible({ disabled: true })
    expect(api.triggerProps['data-disabled']).toBe('')
  })

  it('content has role region', () => {
    const api = createCollapsible()
    expect(api.contentProps.role).toBe('region')
  })

  it('content has data-state matching open state', () => {
    const api = createCollapsible()
    expect(api.contentProps['data-state']).toBe('closed')
  })

  it('content is hidden when closed', () => {
    const api = createCollapsible()
    expect(api.contentProps.hidden).toBe(true)
  })

  it('content is not hidden when open', () => {
    const api = createCollapsible({ defaultOpen: true })
    expect(api.contentProps.hidden).toBe(false)
  })

  it('content has generated id', () => {
    const api = createCollapsible()
    expect(api.contentProps.id).toMatch(/^rfr-collapsible-/)
  })

  it('toggle calls onOpenChange with opposite state', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ onOpenChange })
    api.toggle()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('open calls onOpenChange with true', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ onOpenChange })
    api.open()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('close calls onOpenChange with false', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ defaultOpen: true, onOpenChange })
    api.close()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('toggle does nothing when disabled', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ disabled: true, onOpenChange })
    api.toggle()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('open does nothing when disabled', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ disabled: true, onOpenChange })
    api.open()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('close does nothing when disabled', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ disabled: true, onOpenChange })
    api.close()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('keyboardHandler triggers toggle on Enter', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ onOpenChange })
    const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandler(event)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('keyboardHandler triggers toggle on Space', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ onOpenChange })
    const event = { key: ' ', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandler(event)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('keyboardHandler does nothing on other keys', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ onOpenChange })
    const event = { key: 'a', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandler(event)
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

describe('collapsibleContentVariants', () => {
  it('returns base classes', () => {
    const classes = collapsibleContentVariants()
    expect(classes).toContain('overflow-hidden')
    expect(classes).toContain('transition-all')
  })

  it('returns open state classes', () => {
    const classes = collapsibleContentVariants({ state: 'open' })
    expect(classes).toContain('animate-accordion-down')
  })

  it('returns closed state classes', () => {
    const classes = collapsibleContentVariants({ state: 'closed' })
    expect(classes).toContain('animate-accordion-up')
  })

  it('appends custom className', () => {
    const classes = collapsibleContentVariants({ className: 'my-collapsible' })
    expect(classes).toContain('my-collapsible')
  })
})

describe('disabled behavior extended', () => {
  it('disabled: toggle does nothing', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ disabled: true, onOpenChange })
    api.toggle()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disabled: open() does nothing', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ disabled: true, onOpenChange })
    api.open()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disabled: close() does nothing', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ disabled: true, defaultOpen: true, onOpenChange })
    api.close()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disabled: keyboard Enter does nothing', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ disabled: true, onOpenChange })
    const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandler(event)
    // The keyboardHandler calls toggle which checks disabled
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disabled: keyboard Space does nothing', () => {
    const onOpenChange = vi.fn()
    const api = createCollapsible({ disabled: true, onOpenChange })
    const event = { key: ' ', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandler(event)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('data-disabled is present when disabled', () => {
    const api = createCollapsible({ disabled: true })
    expect(api.triggerProps['data-disabled']).toBe('')
  })

  it('data-disabled is undefined when not disabled', () => {
    const api = createCollapsible({ disabled: false })
    expect(api.triggerProps['data-disabled']).toBeUndefined()
  })
})

describe('controlled mode', () => {
  it('controlled open prop overrides defaultOpen', () => {
    const api = createCollapsible({ open: true, defaultOpen: false })
    expect(api.state.open).toBe(true)
  })

  it('controlled open=false overrides defaultOpen=true', () => {
    const api = createCollapsible({ open: false, defaultOpen: true })
    expect(api.state.open).toBe(false)
  })
})

describe('unique IDs', () => {
  it('multiple collapsibles have unique content IDs', () => {
    const api1 = createCollapsible()
    const api2 = createCollapsible()
    expect(api1.contentProps.id).not.toBe(api2.contentProps.id)
  })

  it('triggerProps aria-controls matches contentProps id', () => {
    const api = createCollapsible()
    expect(api.triggerProps['aria-controls']).toBe(api.contentProps.id)
  })
})
