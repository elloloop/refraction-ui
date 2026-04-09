import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter, FOCUSABLE_SELECTOR } from '@elloloop/shared'
import { createDialog } from '../src/dialog.js'
import { overlayStyles, dialogContentVariants } from '../src/dialog.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createDialog', () => {
  it('defaults to closed state', () => {
    const api = createDialog()
    expect(api.state.open).toBe(false)
  })

  it('respects defaultOpen', () => {
    const api = createDialog({ defaultOpen: true })
    expect(api.state.open).toBe(true)
  })

  it('respects controlled open prop', () => {
    const api = createDialog({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('defaults modal to true', () => {
    const api = createDialog()
    expect(api.contentProps['aria-modal']).toBe(true)
  })

  it('respects modal=false', () => {
    const api = createDialog({ modal: false })
    expect(api.contentProps['aria-modal']).toBe(false)
  })
})

describe('state machine transitions', () => {
  it('opens the dialog', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ onOpenChange })
    api.open()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closes the dialog', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ defaultOpen: true, onOpenChange })
    api.close()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('toggles the dialog', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ onOpenChange })
    api.toggle()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('toggle closes an open dialog', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ defaultOpen: true, onOpenChange })
    api.toggle()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('ARIA props', () => {
  it('provides trigger props with correct aria attributes', () => {
    const api = createDialog()
    expect(api.triggerProps['aria-expanded']).toBe(false)
    expect(api.triggerProps['aria-haspopup']).toBe('dialog')
    expect(api.triggerProps['aria-controls']).toBeDefined()
  })

  it('provides content props with dialog role', () => {
    const api = createDialog()
    expect(api.contentProps.role).toBe('dialog')
    expect(api.contentProps['aria-modal']).toBe(true)
    expect(api.contentProps['aria-labelledby']).toBeDefined()
    expect(api.contentProps['aria-describedby']).toBeDefined()
  })

  it('links trigger aria-controls to content id', () => {
    const api = createDialog()
    expect(api.triggerProps['aria-controls']).toBe(api.ids.content)
    expect(api.contentProps.id).toBe(api.ids.content)
  })

  it('generates unique IDs for title and description', () => {
    const api = createDialog()
    expect(api.ids.title).toMatch(/^rfr-dialog-title-/)
    expect(api.ids.description).toMatch(/^rfr-dialog-desc-/)
    expect(api.ids.title).not.toBe(api.ids.description)
  })

  it('overlay has data-state attribute', () => {
    const closed = createDialog()
    expect(closed.overlayProps['data-state']).toBe('closed')

    const opened = createDialog({ defaultOpen: true })
    expect(opened.overlayProps['data-state']).toBe('open')
  })

  it('trigger aria-expanded reflects open state', () => {
    const closed = createDialog()
    expect(closed.triggerProps['aria-expanded']).toBe(false)

    const opened = createDialog({ open: true })
    expect(opened.triggerProps['aria-expanded']).toBe(true)
  })
})

describe('keyboard handlers', () => {
  it('has Escape handler', () => {
    const api = createDialog()
    expect(api.keyboardHandlers['Escape']).toBeDefined()
  })

  it('Escape calls onOpenChange with false', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ defaultOpen: true, onOpenChange })
    const event = { key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['Escape']!(event)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(event.preventDefault).toHaveBeenCalled()
  })
})

describe('dialog styles', () => {
  it('exports overlay styles', () => {
    expect(overlayStyles).toContain('fixed')
    expect(overlayStyles).toContain('z-50')
    expect(overlayStyles).toContain('bg-black/80')
  })

  it('exports content variant styles', () => {
    const classes = dialogContentVariants()
    expect(classes).toContain('fixed')
    expect(classes).toContain('z-50')
    expect(classes).toContain('sm:rounded-lg')
  })
})

describe('createDialog - non-modal', () => {
  it('modal=false sets aria-modal to false', () => {
    const api = createDialog({ modal: false })
    expect(api.contentProps['aria-modal']).toBe(false)
  })

  it('modal=true (default) sets aria-modal to true', () => {
    const api = createDialog()
    expect(api.contentProps['aria-modal']).toBe(true)
  })
})

describe('createDialog - unique IDs', () => {
  it('multiple createDialog calls generate unique content IDs', () => {
    const api1 = createDialog()
    const api2 = createDialog()
    expect(api1.ids.content).not.toBe(api2.ids.content)
  })

  it('multiple createDialog calls generate unique title IDs', () => {
    const api1 = createDialog()
    const api2 = createDialog()
    expect(api1.ids.title).not.toBe(api2.ids.title)
  })

  it('multiple createDialog calls generate unique description IDs', () => {
    const api1 = createDialog()
    const api2 = createDialog()
    expect(api1.ids.description).not.toBe(api2.ids.description)
  })
})

describe('createDialog - controlled mode', () => {
  it('open prop overrides internal state to true', () => {
    const api = createDialog({ open: true })
    expect(api.state.open).toBe(true)
    expect(api.triggerProps['aria-expanded']).toBe(true)
    expect(api.overlayProps['data-state']).toBe('open')
  })

  it('open=false overrides defaultOpen=true', () => {
    const api = createDialog({ open: false, defaultOpen: true })
    expect(api.state.open).toBe(false)
    expect(api.triggerProps['aria-expanded']).toBe(false)
    expect(api.overlayProps['data-state']).toBe('closed')
  })
})

describe('createDialog - no-op transitions', () => {
  it('close() on already-closed dialog still calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ onOpenChange })
    api.close()
    // The implementation always calls onOpenChange(false) regardless of state
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('open() on already-open dialog still calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ defaultOpen: true, onOpenChange })
    api.open()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })
})

describe('createDialog - Escape preventDefault', () => {
  it('Escape handler calls preventDefault on the event', () => {
    const api = createDialog({ defaultOpen: true })
    let preventDefaultCalled = false
    const mockEvent = {
      key: 'Escape',
      preventDefault: () => { preventDefaultCalled = true },
    } as unknown as KeyboardEvent
    api.keyboardHandlers['Escape']!(mockEvent)
    expect(preventDefaultCalled).toBe(true)
  })

  it('Escape handler calls onOpenChange with false', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ defaultOpen: true, onOpenChange })
    const mockEvent = {
      key: 'Escape',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent
    api.keyboardHandlers['Escape']!(mockEvent)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('createDialog - focusTrapConfig', () => {
  it('includes focusTrapConfig in the API', () => {
    const api = createDialog()
    expect(api.focusTrapConfig).toBeDefined()
  })

  it('focusTrapConfig has onEscape that closes the dialog', () => {
    const onOpenChange = vi.fn()
    const api = createDialog({ defaultOpen: true, onOpenChange })
    api.focusTrapConfig.onEscape!()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('focusTrapConfig has returnFocusOnDeactivate set to true', () => {
    const api = createDialog()
    expect(api.focusTrapConfig.returnFocusOnDeactivate).toBe(true)
  })

  it('FOCUSABLE_SELECTOR is available for framework wrappers', () => {
    // Framework wrappers combine focusTrapConfig with FOCUSABLE_SELECTOR
    expect(FOCUSABLE_SELECTOR).toContain('button:not([disabled])')
    expect(FOCUSABLE_SELECTOR).toContain('a[href]')
    expect(FOCUSABLE_SELECTOR).toContain('input:not([disabled])')
    expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])')
  })
})
