import type { KeyboardHandlerMap } from '@refraction-ui/shared'
import { generateId, Keys, createKeyboardHandler } from '@refraction-ui/shared'

export interface LanguageOption {
  value: string
  label: string
  group?: string
}

export interface LanguageSelectorProps {
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  options: LanguageOption[]
  multiple?: boolean
}

export interface LanguageSelectorAPI {
  /** Current state */
  state: { selectedValues: string[]; isOpen: boolean }
  /** Props to spread on the trigger element */
  triggerProps: {
    'aria-expanded': boolean
    'aria-controls': string
    'aria-haspopup': 'listbox'
    role: 'combobox'
  }
  /** Props to spread on the content/dropdown element */
  contentProps: {
    role: 'listbox'
    id: string
    'aria-multiselectable'?: boolean
  }
  /** Get props for an individual option */
  getOptionProps: (value: string) => {
    role: 'option'
    'aria-selected': boolean
    'data-value': string
  }
  /** Toggle an option's selection */
  toggle: (value: string) => void
  /** Open the dropdown */
  open: () => void
  /** Close the dropdown */
  close: () => void
  /** Keyboard handler map */
  keyboardHandlers: KeyboardHandlerMap
  /** Pre-built keyboard event handler */
  handleKeyDown: (event: KeyboardEvent) => void
}

export function createLanguageSelector(props: LanguageSelectorProps): LanguageSelectorAPI {
  const {
    value: initialValue,
    onValueChange,
    options: _options,
    multiple = false,
  } = props

  const contentId = generateId('rfr-lang-sel')

  let selectedValues: string[] = Array.isArray(initialValue)
    ? [...initialValue]
    : initialValue
      ? [initialValue]
      : []
  let isOpen = false

  const state = { selectedValues: [...selectedValues], isOpen }

  function setOpen(value: boolean) {
    isOpen = value
    state.isOpen = value
  }

  function toggle(value: string) {
    if (multiple) {
      const index = selectedValues.indexOf(value)
      if (index >= 0) {
        selectedValues.splice(index, 1)
      } else {
        selectedValues.push(value)
      }
      state.selectedValues = [...selectedValues]
      onValueChange?.([...selectedValues])
    } else {
      selectedValues = [value]
      state.selectedValues = [value]
      onValueChange?.(value)
      setOpen(false)
    }
  }

  const triggerProps = {
    'aria-expanded': isOpen,
    'aria-controls': contentId,
    'aria-haspopup': 'listbox' as const,
    role: 'combobox' as const,
  }

  const contentProps: LanguageSelectorAPI['contentProps'] = {
    role: 'listbox' as const,
    id: contentId,
    ...(multiple ? { 'aria-multiselectable': true } : {}),
  }

  function getOptionProps(value: string) {
    return {
      role: 'option' as const,
      'aria-selected': selectedValues.includes(value),
      'data-value': value,
    }
  }

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.Escape]: () => {
      setOpen(false)
    },
    [Keys.Enter]: () => {
      setOpen(!isOpen)
    },
    [Keys.Space]: () => {
      setOpen(!isOpen)
    },
    [Keys.ArrowDown]: () => {
      if (!isOpen) {
        setOpen(true)
      }
    },
    [Keys.ArrowUp]: () => {
      if (!isOpen) {
        setOpen(true)
      }
    },
  }

  const handleKeyDown = createKeyboardHandler(keyboardHandlers)

  return {
    state,
    triggerProps,
    contentProps,
    getOptionProps,
    toggle,
    open: () => setOpen(true),
    close: () => setOpen(false),
    keyboardHandlers,
    handleKeyDown,
  }
}
