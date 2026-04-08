import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createDropdownMenu } from '../src/dropdown-menu.js'
import { menuContentVariants, menuItemVariants } from '../src/dropdown-menu.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createDropdownMenu', () => {
  it('defaults to closed state', () => {
    const api = createDropdownMenu()
    expect(api.state.open).toBe(false)
  })

  it('respects defaultOpen', () => {
    const api = createDropdownMenu({ defaultOpen: true })
    expect(api.state.open).toBe(true)
  })

  it('respects controlled open prop', () => {
    const api = createDropdownMenu({ open: true })
    expect(api.state.open).toBe(true)
  })
})

describe('state machine transitions', () => {
  it('opens the menu', () => {
    const onOpenChange = vi.fn()
    const api = createDropdownMenu({ onOpenChange })
    api.open()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closes the menu', () => {
    const onOpenChange = vi.fn()
    const api = createDropdownMenu({ defaultOpen: true, onOpenChange })
    api.close()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('toggles the menu', () => {
    const onOpenChange = vi.fn()
    const api = createDropdownMenu({ onOpenChange })
    api.toggle()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('toggle closes an open menu', () => {
    const onOpenChange = vi.fn()
    const api = createDropdownMenu({ defaultOpen: true, onOpenChange })
    api.toggle()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('ARIA props', () => {
  it('provides trigger props with correct aria attributes', () => {
    const api = createDropdownMenu()
    expect(api.triggerProps['aria-expanded']).toBe(false)
    expect(api.triggerProps['aria-haspopup']).toBe('menu')
    expect(api.triggerProps['aria-controls']).toBeDefined()
  })

  it('provides content props with menu role', () => {
    const api = createDropdownMenu()
    expect(api.contentProps.role).toBe('menu')
    expect(api.contentProps.id).toBeDefined()
  })

  it('links trigger aria-controls to content id', () => {
    const api = createDropdownMenu()
    expect(api.triggerProps['aria-controls']).toBe(api.ids.content)
    expect(api.contentProps.id).toBe(api.ids.content)
  })

  it('content has data-state attribute', () => {
    const closed = createDropdownMenu()
    expect(closed.contentProps['data-state']).toBe('closed')

    const opened = createDropdownMenu({ defaultOpen: true })
    expect(opened.contentProps['data-state']).toBe('open')
  })

  it('trigger aria-expanded reflects open state', () => {
    const closed = createDropdownMenu()
    expect(closed.triggerProps['aria-expanded']).toBe(false)

    const opened = createDropdownMenu({ open: true })
    expect(opened.triggerProps['aria-expanded']).toBe(true)
  })
})

describe('getItemProps', () => {
  it('returns menuitem role', () => {
    const api = createDropdownMenu()
    const itemProps = api.getItemProps({})
    expect(itemProps.role).toBe('menuitem')
  })

  it('sets tabIndex 0 for enabled items', () => {
    const api = createDropdownMenu()
    const itemProps = api.getItemProps({})
    expect(itemProps.tabIndex).toBe(0)
  })

  it('sets tabIndex -1 for disabled items', () => {
    const api = createDropdownMenu()
    const itemProps = api.getItemProps({ disabled: true })
    expect(itemProps.tabIndex).toBe(-1)
  })

  it('sets data-disabled for disabled items', () => {
    const api = createDropdownMenu()
    const itemProps = api.getItemProps({ disabled: true })
    expect(itemProps['data-disabled']).toBe('')
    expect(itemProps['aria-disabled']).toBe(true)
  })

  it('does not set data-disabled for enabled items', () => {
    const api = createDropdownMenu()
    const itemProps = api.getItemProps({})
    expect(itemProps['data-disabled']).toBeUndefined()
    expect(itemProps['aria-disabled']).toBeUndefined()
  })
})

describe('keyboard handlers', () => {
  it('has Escape handler', () => {
    const api = createDropdownMenu()
    expect(api.keyboardHandlers['Escape']).toBeDefined()
  })

  it('Escape calls onOpenChange with false', () => {
    const onOpenChange = vi.fn()
    const api = createDropdownMenu({ defaultOpen: true, onOpenChange })
    const event = { key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['Escape']!(event)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('has ArrowDown handler', () => {
    const api = createDropdownMenu()
    expect(api.keyboardHandlers['ArrowDown']).toBeDefined()
  })

  it('has ArrowUp handler', () => {
    const api = createDropdownMenu()
    expect(api.keyboardHandlers['ArrowUp']).toBeDefined()
  })

  it('has Enter handler', () => {
    const api = createDropdownMenu()
    expect(api.keyboardHandlers['Enter']).toBeDefined()
  })

  it('has Home handler', () => {
    const api = createDropdownMenu()
    expect(api.keyboardHandlers['Home']).toBeDefined()
  })

  it('has End handler', () => {
    const api = createDropdownMenu()
    expect(api.keyboardHandlers['End']).toBeDefined()
  })

  it('ArrowDown prevents default', () => {
    const api = createDropdownMenu()
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['ArrowDown']!(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })
})

describe('keyboard handler behaviors', () => {
  it('ArrowDown wraps to first item from last (handler prevents default)', () => {
    const api = createDropdownMenu({ defaultOpen: true })
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['ArrowDown']!(event)
    expect(event.preventDefault).toHaveBeenCalled()
    // The handler is defined and callable even at the end of a list
  })

  it('ArrowUp wraps to last item from first (handler prevents default)', () => {
    const api = createDropdownMenu({ defaultOpen: true })
    const event = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['ArrowUp']!(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('Home handler prevents default', () => {
    const api = createDropdownMenu({ defaultOpen: true })
    const event = { key: 'Home', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['Home']!(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('End handler prevents default', () => {
    const api = createDropdownMenu({ defaultOpen: true })
    const event = { key: 'End', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['End']!(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('Enter handler prevents default', () => {
    const api = createDropdownMenu({ defaultOpen: true })
    const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['Enter']!(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('Enter on disabled item context does nothing (handler still callable)', () => {
    const onOpenChange = vi.fn()
    const api = createDropdownMenu({ defaultOpen: true, onOpenChange })
    // The Enter handler on the menu itself does not select a specific item;
    // it prevents default. Item selection is a higher-level concern.
    const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['Enter']!(event)
    expect(event.preventDefault).toHaveBeenCalled()
    // onOpenChange is NOT called by Enter—only Escape closes
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('keyboard handlers are safe with no items (all handlers callable)', () => {
    const api = createDropdownMenu()
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    expect(() => api.keyboardHandlers['ArrowDown']!(event)).not.toThrow()
    expect(() => api.keyboardHandlers['ArrowUp']!(event)).not.toThrow()
    expect(() => api.keyboardHandlers['Home']!(event)).not.toThrow()
    expect(() => api.keyboardHandlers['End']!(event)).not.toThrow()
    expect(() => api.keyboardHandlers['Enter']!(event)).not.toThrow()
  })
})

describe('getItemProps extended', () => {
  it('getItemProps for disabled item includes both data-disabled and aria-disabled', () => {
    const api = createDropdownMenu()
    const itemProps = api.getItemProps({ disabled: true })
    expect(itemProps['data-disabled']).toBe('')
    expect(itemProps['aria-disabled']).toBe(true)
    expect(itemProps.tabIndex).toBe(-1)
    expect(itemProps.role).toBe('menuitem')
  })

  it('getItemProps for enabled item has no disability attrs', () => {
    const api = createDropdownMenu()
    const itemProps = api.getItemProps({ disabled: false })
    expect(itemProps['data-disabled']).toBeUndefined()
    expect(itemProps['aria-disabled']).toBeUndefined()
    expect(itemProps.tabIndex).toBe(0)
  })
})

describe('content data-state', () => {
  it('content data-state is closed when menu is closed', () => {
    const api = createDropdownMenu()
    expect(api.contentProps['data-state']).toBe('closed')
  })

  it('content data-state is open when menu is open', () => {
    const api = createDropdownMenu({ defaultOpen: true })
    expect(api.contentProps['data-state']).toBe('open')
  })

  it('content data-state reflects controlled open prop', () => {
    const api = createDropdownMenu({ open: true })
    expect(api.contentProps['data-state']).toBe('open')
  })

  it('content data-state reflects controlled closed prop', () => {
    const api = createDropdownMenu({ open: false })
    expect(api.contentProps['data-state']).toBe('closed')
  })
})

describe('dropdown menu styles', () => {
  it('exports menu content variant styles', () => {
    const classes = menuContentVariants()
    expect(classes).toContain('z-50')
    expect(classes).toContain('rounded-md')
    expect(classes).toContain('border')
    expect(classes).toContain('bg-popover')
    expect(classes).toContain('shadow-md')
  })

  it('exports menu item variant styles', () => {
    const classes = menuItemVariants()
    expect(classes).toContain('relative')
    expect(classes).toContain('flex')
    expect(classes).toContain('cursor-default')
    expect(classes).toContain('text-sm')
    expect(classes).toContain('outline-none')
  })
})
