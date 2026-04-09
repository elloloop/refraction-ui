import type { AccessibilityProps } from '@elloloop/shared'
import { generateId, Keys, createKeyboardHandler } from '@elloloop/shared'

export interface CollapsibleProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

export interface CollapsibleAPI {
  /** Current open state */
  state: { open: boolean }
  /** Props to spread on the trigger element */
  triggerProps: {
    'aria-expanded': boolean
    'aria-controls': string
    'data-state': 'open' | 'closed'
    'data-disabled': string | undefined
  }
  /** Props to spread on the content element */
  contentProps: {
    id: string
    role: 'region'
    'data-state': 'open' | 'closed'
    hidden: boolean
  }
  /** Toggle the open state */
  toggle: () => void
  /** Open the collapsible */
  open: () => void
  /** Close the collapsible */
  close: () => void
  /** Keyboard event handler for Enter/Space toggle */
  keyboardHandler: (event: KeyboardEvent) => void
}

export function createCollapsible(props: CollapsibleProps = {}): CollapsibleAPI {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
  } = props

  const isControlled = controlledOpen !== undefined
  let internalOpen = isControlled ? controlledOpen : defaultOpen
  const contentId = generateId('rfr-collapsible')

  const setOpen = (next: boolean) => {
    if (disabled) return
    if (!isControlled) {
      internalOpen = next
    }
    onOpenChange?.(next)
  }

  const toggle = () => setOpen(!internalOpen)
  const openFn = () => setOpen(true)
  const closeFn = () => setOpen(false)

  const keyboardHandler = createKeyboardHandler({
    [Keys.Enter]: (event: KeyboardEvent) => {
      event.preventDefault()
      toggle()
    },
    [Keys.Space]: (event: KeyboardEvent) => {
      event.preventDefault()
      toggle()
    },
  })

  const dataState = internalOpen ? 'open' : 'closed'

  return {
    state: { open: internalOpen },
    triggerProps: {
      'aria-expanded': internalOpen,
      'aria-controls': contentId,
      'data-state': dataState,
      'data-disabled': disabled ? '' : undefined,
    },
    contentProps: {
      id: contentId,
      role: 'region',
      'data-state': dataState,
      hidden: !internalOpen,
    },
    toggle,
    open: openFn,
    close: closeFn,
    keyboardHandler,
  }
}
