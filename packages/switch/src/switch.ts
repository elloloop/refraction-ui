import type { AccessibilityProps, KeyboardHandlerMap } from '@refraction-ui/shared'
import { Keys } from '@refraction-ui/shared'

export interface SwitchProps {
  checked?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
}

export interface SwitchAPI {
  /** ARIA attributes to spread on the element */
  ariaProps: Partial<AccessibilityProps>
  /** Keyboard handlers to attach */
  keyboardHandlers: KeyboardHandlerMap
  /** Whether interaction should be blocked */
  isInteractive: boolean
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
  /** Current state */
  state: {
    checked: boolean
    disabled: boolean
  }
}

export function createSwitch(props: SwitchProps = {}): SwitchAPI {
  const { checked = false, disabled = false } = props
  const isInteractive = !disabled

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'switch',
    'aria-checked': checked,
  }

  if (disabled) {
    ariaProps['aria-disabled'] = true
  }

  const dataAttributes: Record<string, string> = {}
  if (checked) {
    dataAttributes['data-state'] = 'checked'
  } else {
    dataAttributes['data-state'] = 'unchecked'
  }
  if (disabled) {
    dataAttributes['data-disabled'] = ''
  }

  const keyboardHandlers: KeyboardHandlerMap = {}
  if (!isInteractive) {
    keyboardHandlers[Keys.Space] = (e) => e.preventDefault()
  }

  return {
    ariaProps,
    keyboardHandlers,
    isInteractive,
    dataAttributes,
    state: { checked, disabled },
  }
}
