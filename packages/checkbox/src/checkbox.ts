import type { AccessibilityProps, KeyboardHandlerMap } from '@elloloop/shared'
import { Keys } from '@elloloop/shared'

export type CheckedState = boolean | 'indeterminate'

export interface CheckboxProps {
  checked?: CheckedState
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
}

export interface CheckboxAPI {
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
    checked: CheckedState
    disabled: boolean
  }
}

export function createCheckbox(props: CheckboxProps = {}): CheckboxAPI {
  const { checked = false, disabled = false } = props
  const isInteractive = !disabled

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'checkbox',
    'aria-checked': checked === 'indeterminate' ? 'mixed' : checked,
  }

  if (disabled) {
    ariaProps['aria-disabled'] = true
  }

  const dataAttributes: Record<string, string> = {}
  if (checked === 'indeterminate') {
    dataAttributes['data-state'] = 'indeterminate'
  } else if (checked) {
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

/** SVG path data for the check icon */
export const checkIconPath = 'M20 6L9 17l-5-5'

/** SVG path data for the indeterminate/minus icon */
export const indeterminateIconPath = 'M5 12h14'
