import type { AccessibilityProps, KeyboardHandlerMap } from '@refraction-ui/shared'
import { Keys } from '@refraction-ui/shared'

export type OtpInputType = 'number' | 'text'

export interface OtpInputProps {
  length?: number
  value?: string
  autoFocus?: boolean
  type?: OtpInputType
  disabled?: boolean
}

export interface OtpSlotProps {
  ariaProps: Partial<AccessibilityProps>
  dataAttributes: Record<string, string>
  inputProps: {
    maxLength: number
    inputMode: string
    pattern?: string
    autoComplete: string
    disabled: boolean
  }
}

export interface OtpInputAPI {
  /** Current state */
  state: {
    values: string[]
    focusedIndex: number
    length: number
    disabled: boolean
  }
  /** Set the value at a specific index */
  setValue: (index: number, char: string) => string[]
  /** Get the combined OTP string */
  getValue: () => string
  /** Move focus in a direction, returns new index */
  moveFocus: (direction: 'left' | 'right') => number
  /** Get aria/input props for a specific slot */
  getSlotProps: (index: number) => OtpSlotProps
  /** Keyboard handlers factory for a specific slot */
  getKeyboardHandlers: (
    index: number,
    callbacks?: {
      onMoveFocus?: (index: number) => void
      onSetValue?: (index: number, values: string[]) => void
    },
  ) => KeyboardHandlerMap
  /** Parse a paste string into values array */
  parsePaste: (text: string) => string[]
  /** Root container ARIA props */
  rootAriaProps: Partial<AccessibilityProps>
  /** Whether interaction should be blocked */
  isInteractive: boolean
}

export function createOtpInput(props: OtpInputProps = {}): OtpInputAPI {
  const {
    length = 6,
    value = '',
    autoFocus = false,
    type = 'number',
    disabled = false,
  } = props

  const isInteractive = !disabled

  // Initialize values from the provided value string
  const values: string[] = Array.from({ length }, (_, i) => value.charAt(i) || '')
  let focusedIndex = autoFocus ? 0 : -1

  const rootAriaProps: Partial<AccessibilityProps> = {
    role: 'group',
    'aria-label': 'One-time password input',
  }

  function setValue(index: number, char: string): string[] {
    if (index < 0 || index >= length) return [...values]
    const filtered = type === 'number' ? char.replace(/[^0-9]/g, '') : char
    const newValues = [...values]
    newValues[index] = filtered.charAt(0) || ''
    // Update internal state
    for (let i = 0; i < length; i++) {
      values[i] = newValues[i]
    }
    return newValues
  }

  function getValue(): string {
    return values.join('')
  }

  function moveFocus(direction: 'left' | 'right'): number {
    if (direction === 'left') {
      focusedIndex = Math.max(0, focusedIndex - 1)
    } else {
      focusedIndex = Math.min(length - 1, focusedIndex + 1)
    }
    return focusedIndex
  }

  function getSlotProps(index: number): OtpSlotProps {
    const isFocused = index === focusedIndex
    const isFilled = values[index] !== ''

    const ariaProps: Partial<AccessibilityProps> = {
      'aria-label': `Digit ${index + 1} of ${length}`,
    }

    const dataAttributes: Record<string, string> = {
      'data-slot': 'otp-slot',
    }
    if (isFocused) {
      dataAttributes['data-focused'] = ''
    }
    if (isFilled) {
      dataAttributes['data-filled'] = ''
    }

    const inputProps = {
      maxLength: 1,
      inputMode: type === 'number' ? 'numeric' : 'text',
      pattern: type === 'number' ? '[0-9]*' : undefined,
      autoComplete: index === 0 ? 'one-time-code' : 'off',
      disabled,
    }

    return { ariaProps, dataAttributes, inputProps }
  }

  function getKeyboardHandlers(
    index: number,
    callbacks?: {
      onMoveFocus?: (index: number) => void
      onSetValue?: (index: number, values: string[]) => void
    },
  ): KeyboardHandlerMap {
    if (!isInteractive) {
      return {
        [Keys.Backspace]: (e) => e.preventDefault(),
        [Keys.ArrowLeft]: (e) => e.preventDefault(),
        [Keys.ArrowRight]: (e) => e.preventDefault(),
      }
    }

    return {
      [Keys.Backspace]: (e) => {
        e.preventDefault()
        if (values[index]) {
          const newValues = setValue(index, '')
          callbacks?.onSetValue?.(index, newValues)
        } else if (index > 0) {
          focusedIndex = index - 1
          const newValues = setValue(index - 1, '')
          callbacks?.onSetValue?.(index - 1, newValues)
          callbacks?.onMoveFocus?.(focusedIndex)
        }
      },
      [Keys.ArrowLeft]: (e) => {
        e.preventDefault()
        if (index > 0) {
          focusedIndex = index - 1
          callbacks?.onMoveFocus?.(focusedIndex)
        }
      },
      [Keys.ArrowRight]: (e) => {
        e.preventDefault()
        if (index < length - 1) {
          focusedIndex = index + 1
          callbacks?.onMoveFocus?.(focusedIndex)
        }
      },
    }
  }

  function parsePaste(text: string): string[] {
    const chars = type === 'number' ? text.replace(/[^0-9]/g, '') : text
    return Array.from({ length }, (_, i) => chars.charAt(i) || '')
  }

  return {
    state: {
      values,
      focusedIndex,
      length,
      disabled,
    },
    setValue,
    getValue,
    moveFocus,
    getSlotProps,
    getKeyboardHandlers,
    parsePaste,
    rootAriaProps,
    isInteractive,
  }
}
