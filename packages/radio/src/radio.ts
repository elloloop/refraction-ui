import type { AccessibilityProps } from '@refraction-ui/shared'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
}

export interface RadioGroupAPI {
  state: { selectedValue: string | undefined }
  groupProps: Partial<AccessibilityProps> & Record<string, unknown>
  getItemProps(value: string, disabled?: boolean): Partial<AccessibilityProps> & Record<string, unknown>
  select(value: string): void
  keyboardHandlers: Record<string, (e: KeyboardEvent) => void>
}

export function createRadioGroup(props: RadioGroupProps = {}): RadioGroupAPI {
  const { value: controlled, defaultValue, onValueChange, name, disabled = false, orientation = 'vertical' } = props
  let selected = controlled ?? defaultValue

  function select(value: string) {
    if (disabled) return
    selected = value
    onValueChange?.(value)
  }

  const groupProps = {
    role: 'radiogroup' as const,
    'aria-orientation': orientation,
    ...(disabled ? { 'aria-disabled': true } : {}),
  }

  function getItemProps(value: string, itemDisabled?: boolean) {
    const isSelected = selected === value
    const isDisabled = disabled || itemDisabled
    return {
      role: 'radio' as const,
      'aria-checked': isSelected,
      'aria-disabled': isDisabled || undefined,
      tabIndex: isSelected ? 0 : -1,
      'data-state': isSelected ? 'checked' : 'unchecked',
      ...(isDisabled ? { 'data-disabled': '' } : {}),
      ...(name ? { name } : {}),
    }
  }

  const keyboardHandlers: Record<string, (e: KeyboardEvent) => void> = {
    ArrowDown(e) { e.preventDefault() },
    ArrowUp(e) { e.preventDefault() },
    ArrowRight(e) { e.preventDefault() },
    ArrowLeft(e) { e.preventDefault() },
  }

  return {
    state: { get selectedValue() { return selected } },
    groupProps,
    getItemProps,
    select,
    keyboardHandlers,
  }
}
