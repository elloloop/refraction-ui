import type { AccessibilityProps, KeyboardHandlerMap } from '@elloloop/shared'
import { Keys, generateId } from '@elloloop/shared'

export interface MobileNavProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  id?: string
}

export interface MobileNavState {
  open: boolean
}

export interface MobileNavAPI {
  /** Current state */
  state: MobileNavState
  /** ARIA and interaction props for the trigger button */
  triggerProps: Partial<AccessibilityProps> & Record<string, string | boolean | undefined>
  /** ARIA and data attributes for the content panel */
  contentProps: Partial<AccessibilityProps> & Record<string, string | boolean | undefined>
  /** Toggle open state */
  toggle: () => void
  /** Open the nav */
  open: () => void
  /** Close the nav */
  close: () => void
  /** Keyboard handlers (Escape closes) */
  keyboardHandlers: KeyboardHandlerMap
}

export function createMobileNav(props: MobileNavProps = {}): MobileNavAPI {
  const isOpen = props.open ?? false
  const id = props.id ?? generateId('rfr-mobile-nav')
  const contentId = `${id}-content`

  const state: MobileNavState = {
    open: isOpen,
  }

  const triggerProps: MobileNavAPI['triggerProps'] = {
    'aria-expanded': isOpen,
    'aria-controls': contentId,
    'aria-label': 'Toggle menu',
  }

  const contentProps: MobileNavAPI['contentProps'] = {
    id: contentId,
    role: 'menu',
    'data-state': isOpen ? 'open' : 'closed',
  }

  function setOpen(value: boolean) {
    state.open = value
    props.onOpenChange?.(value)
  }

  const toggle = () => setOpen(!state.open)
  const open = () => setOpen(true)
  const close = () => setOpen(false)

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.Escape]: () => close(),
  }

  return {
    state,
    triggerProps,
    contentProps,
    toggle,
    open,
    close,
    keyboardHandlers,
  }
}
