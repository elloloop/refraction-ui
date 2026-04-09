import type { AccessibilityProps, KeyboardHandlerMap } from '@refraction-ui/shared'
import { createMachine, Keys, generateId } from '@refraction-ui/shared'

export interface DropdownMenuProps {
  /** Whether the menu is open (controlled) */
  open?: boolean
  /** Whether the menu starts open (uncontrolled) */
  defaultOpen?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
}

export interface MenuItemProps {
  /** Whether the item is disabled */
  disabled?: boolean
  /** Callback when the item is selected */
  onSelect?: () => void
}

export interface DropdownMenuState {
  open: boolean
}

export interface DropdownMenuAPI {
  /** Current menu state */
  state: DropdownMenuState
  /** ARIA attributes for the trigger button */
  triggerProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** ARIA attributes for the menu content */
  contentProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Factory for menu item props */
  getItemProps(item: MenuItemProps): Partial<AccessibilityProps> & Record<string, unknown>
  /** Open the menu */
  open(): void
  /** Close the menu */
  close(): void
  /** Toggle the menu */
  toggle(): void
  /** Keyboard handlers for the menu */
  keyboardHandlers: KeyboardHandlerMap
  /** Generated IDs for aria linking */
  ids: {
    content: string
  }
}

export function createDropdownMenu(props: DropdownMenuProps = {}): DropdownMenuAPI {
  const { open: controlledOpen, defaultOpen = false, onOpenChange } = props

  const machine = createMachine<'open' | 'closed', 'OPEN' | 'CLOSE'>({
    initial: controlledOpen ?? defaultOpen ? 'open' : 'closed',
    states: {
      closed: { on: { OPEN: 'open' } },
      open: { on: { CLOSE: 'closed' } },
    },
  })

  const contentId = generateId('rfr-dropdown-menu')

  function isOpen(): boolean {
    if (controlledOpen !== undefined) return controlledOpen
    return machine.matches('open')
  }

  function openMenu(): void {
    machine.send('OPEN')
    onOpenChange?.(true)
  }

  function closeMenu(): void {
    machine.send('CLOSE')
    onOpenChange?.(false)
  }

  function toggleMenu(): void {
    if (isOpen()) {
      closeMenu()
    } else {
      openMenu()
    }
  }

  function getItemProps(item: MenuItemProps): Partial<AccessibilityProps> & Record<string, unknown> {
    return {
      role: 'menuitem',
      tabIndex: item.disabled ? -1 : 0,
      'data-disabled': item.disabled ? '' : undefined,
      'aria-disabled': item.disabled || undefined,
    }
  }

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.Escape]: (e) => {
      e.preventDefault()
      closeMenu()
    },
    [Keys.ArrowDown]: (e) => {
      e.preventDefault()
    },
    [Keys.ArrowUp]: (e) => {
      e.preventDefault()
    },
    [Keys.Enter]: (e) => {
      e.preventDefault()
    },
    [Keys.Home]: (e) => {
      e.preventDefault()
    },
    [Keys.End]: (e) => {
      e.preventDefault()
    },
  }

  const triggerProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    'aria-expanded': isOpen(),
    'aria-controls': contentId,
    'aria-haspopup': 'menu',
  }

  const contentProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'menu',
    id: contentId,
    'data-state': isOpen() ? 'open' : 'closed',
  }

  return {
    state: { open: isOpen() },
    triggerProps,
    contentProps,
    getItemProps,
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    keyboardHandlers,
    ids: {
      content: contentId,
    },
  }
}
