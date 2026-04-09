import type { AccessibilityProps, KeyboardHandlerMap } from '@refraction-ui/shared'
import { Keys, generateId } from '@refraction-ui/shared'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  open?: boolean
  name?: string
}

export interface SelectAPI {
  /** Trigger element ARIA + keyboard props */
  triggerProps: {
    ariaProps: Partial<AccessibilityProps>
    keyboardHandlers: KeyboardHandlerMap
    dataAttributes: Record<string, string>
  }
  /** Content (dropdown) props */
  contentProps: {
    ariaProps: Partial<AccessibilityProps>
    dataAttributes: Record<string, string>
  }
  /** Get props for a single option */
  getOptionProps: (option: SelectOption) => {
    ariaProps: Partial<AccessibilityProps>
    dataAttributes: Record<string, string>
    isSelected: boolean
  }
  /** Whether interaction should be blocked */
  isInteractive: boolean
  /** Current state */
  state: {
    open: boolean
    selectedValue: string | undefined
    selectedLabel: string | undefined
    disabled: boolean
    placeholder: string
  }
  /** Generated IDs for trigger/content association */
  ids: {
    trigger: string
    content: string
  }
}

export function createSelect(props: SelectProps = {}): SelectAPI {
  const {
    value,
    options = [],
    placeholder = 'Select an option',
    disabled = false,
    open = false,
  } = props

  const isInteractive = !disabled
  const selectedOption = options.find((o) => o.value === value)

  const triggerId = generateId('select-trigger')
  const contentId = generateId('select-content')

  const triggerAriaProps: Partial<AccessibilityProps> = {
    role: 'combobox',
    'aria-expanded': open,
    'aria-controls': contentId,
    'aria-labelledby': triggerId,
  }
  if (disabled) {
    triggerAriaProps['aria-disabled'] = true
  }

  const triggerKeyboardHandlers: KeyboardHandlerMap = {}
  if (!isInteractive) {
    triggerKeyboardHandlers[Keys.Enter] = (e) => e.preventDefault()
    triggerKeyboardHandlers[Keys.Space] = (e) => e.preventDefault()
    triggerKeyboardHandlers[Keys.ArrowDown] = (e) => e.preventDefault()
    triggerKeyboardHandlers[Keys.ArrowUp] = (e) => e.preventDefault()
  }

  const triggerDataAttributes: Record<string, string> = {
    'data-state': open ? 'open' : 'closed',
  }
  if (disabled) {
    triggerDataAttributes['data-disabled'] = ''
  }

  const contentAriaProps: Partial<AccessibilityProps> = {
    role: 'listbox',
    'aria-labelledby': triggerId,
  }

  const contentDataAttributes: Record<string, string> = {
    'data-state': open ? 'open' : 'closed',
  }

  function getOptionProps(option: SelectOption) {
    const isSelected = option.value === value
    const optionAriaProps: Partial<AccessibilityProps> = {
      role: 'option',
      'aria-selected': isSelected,
    }
    if (option.disabled) {
      optionAriaProps['aria-disabled'] = true
    }

    const optionDataAttributes: Record<string, string> = {}
    if (isSelected) {
      optionDataAttributes['data-state'] = 'checked'
    }
    if (option.disabled) {
      optionDataAttributes['data-disabled'] = ''
    }

    return {
      ariaProps: optionAriaProps,
      dataAttributes: optionDataAttributes,
      isSelected,
    }
  }

  return {
    triggerProps: {
      ariaProps: triggerAriaProps,
      keyboardHandlers: triggerKeyboardHandlers,
      dataAttributes: triggerDataAttributes,
    },
    contentProps: {
      ariaProps: contentAriaProps,
      dataAttributes: contentDataAttributes,
    },
    getOptionProps,
    isInteractive,
    state: {
      open,
      selectedValue: selectedOption?.value,
      selectedLabel: selectedOption?.label,
      disabled,
      placeholder,
    },
    ids: {
      trigger: triggerId,
      content: contentId,
    },
  }
}
