import type { AccessibilityProps, Side, KeyboardHandlerMap } from '@refraction-ui/shared'
import { generateId, Keys, createKeyboardHandler } from '@refraction-ui/shared'

export interface PopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: Side
}

export interface PopoverAPI {
  /** Current open state */
  state: { open: boolean }
  /** Props to spread on the trigger element */
  triggerProps: Partial<AccessibilityProps> & {
    'aria-expanded': boolean
    'aria-controls': string
    'aria-haspopup': 'dialog'
  }
  /** Props to spread on the content element */
  contentProps: {
    role: 'dialog'
    id: string
  }
  /** Resolved placement */
  placement: Side
  /** Open the popover */
  open: () => void
  /** Close the popover */
  close: () => void
  /** Toggle the popover */
  toggle: () => void
  /** Keyboard handler map (Escape to close) */
  keyboardHandlers: KeyboardHandlerMap
  /** Pre-built keyboard event handler */
  handleKeyDown: (event: KeyboardEvent) => void
}

export function createPopover(props: PopoverProps = {}): PopoverAPI {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    placement = 'bottom',
  } = props

  const contentId = generateId('rfr-popover')

  let isOpen = controlledOpen ?? defaultOpen

  const state = { open: isOpen }

  function setOpen(value: boolean) {
    isOpen = value
    state.open = value
    onOpenChange?.(value)
  }

  const triggerProps = {
    'aria-expanded': isOpen,
    'aria-controls': contentId,
    'aria-haspopup': 'dialog' as const,
  }

  const contentProps = {
    role: 'dialog' as const,
    id: contentId,
  }

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.Escape]: () => {
      setOpen(false)
    },
  }

  const handleKeyDown = createKeyboardHandler(keyboardHandlers)

  return {
    state,
    triggerProps,
    contentProps,
    placement,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!isOpen),
    keyboardHandlers,
    handleKeyDown,
  }
}
