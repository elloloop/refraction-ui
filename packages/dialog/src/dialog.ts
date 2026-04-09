import type { AccessibilityProps, KeyboardHandlerMap, FocusTrapConfig } from '@elloloop/shared'
import { createMachine, Keys, generateId, FOCUSABLE_SELECTOR } from '@elloloop/shared'

export interface DialogProps {
  /** Whether the dialog is open (controlled) */
  open?: boolean
  /** Whether the dialog starts open (uncontrolled) */
  defaultOpen?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Whether the dialog is modal (default: true) */
  modal?: boolean
}

export interface DialogState {
  open: boolean
}

export interface DialogAPI {
  /** Current dialog state */
  state: DialogState
  /** ARIA attributes for the trigger button */
  triggerProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** ARIA attributes for the dialog content */
  contentProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Data attributes for the overlay */
  overlayProps: Record<string, string>
  /** Open the dialog */
  open(): void
  /** Close the dialog */
  close(): void
  /** Toggle the dialog */
  toggle(): void
  /** Keyboard handlers (Escape to close) */
  keyboardHandlers: KeyboardHandlerMap
  /** Generated IDs for aria linking */
  ids: {
    content: string
    title: string
    description: string
  }
  /**
   * Focus trap configuration for framework wrappers.
   * Pass this to createFocusTrap() with a container element.
   */
  focusTrapConfig: Omit<FocusTrapConfig, 'container'>
}

export function createDialog(props: DialogProps = {}): DialogAPI {
  const { open: controlledOpen, defaultOpen = false, onOpenChange, modal = true } = props

  const machine = createMachine<'open' | 'closed', 'OPEN' | 'CLOSE'>({
    initial: controlledOpen ?? defaultOpen ? 'open' : 'closed',
    states: {
      closed: { on: { OPEN: 'open' } },
      open: { on: { CLOSE: 'closed' } },
    },
  })

  const contentId = generateId('rfr-dialog')
  const titleId = generateId('rfr-dialog-title')
  const descriptionId = generateId('rfr-dialog-desc')

  function isOpen(): boolean {
    if (controlledOpen !== undefined) return controlledOpen
    return machine.matches('open')
  }

  function openDialog(): void {
    machine.send('OPEN')
    onOpenChange?.(true)
  }

  function closeDialog(): void {
    machine.send('CLOSE')
    onOpenChange?.(false)
  }

  function toggleDialog(): void {
    if (isOpen()) {
      closeDialog()
    } else {
      openDialog()
    }
  }

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.Escape]: (e) => {
      e.preventDefault()
      closeDialog()
    },
  }

  const triggerProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    'aria-expanded': isOpen(),
    'aria-controls': contentId,
    'aria-haspopup': 'dialog',
  }

  const contentProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'dialog',
    'aria-modal': modal,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
    id: contentId,
  }

  const overlayProps: Record<string, string> = {
    'data-state': isOpen() ? 'open' : 'closed',
  }

  const focusTrapConfig: Omit<FocusTrapConfig, 'container'> = {
    onEscape: closeDialog,
    returnFocusOnDeactivate: true,
  }

  return {
    state: { open: isOpen() },
    triggerProps,
    contentProps,
    overlayProps,
    open: openDialog,
    close: closeDialog,
    toggle: toggleDialog,
    keyboardHandlers,
    ids: {
      content: contentId,
      title: titleId,
      description: descriptionId,
    },
    focusTrapConfig,
  }
}
