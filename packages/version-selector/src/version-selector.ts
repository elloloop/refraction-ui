import type { KeyboardHandlerMap } from '@refraction-ui/shared'
import { generateId, Keys, createKeyboardHandler } from '@refraction-ui/shared'

export interface VersionOption {
  value: string
  label: string
  isLatest?: boolean
}

export interface VersionSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  versions: VersionOption[]
}

export interface VersionSelectorAPI {
  /** Current state */
  state: { selectedVersion: string; isOpen: boolean }
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
  }
  /** Get props for an individual option */
  getOptionProps: (value: string) => {
    role: 'option'
    'aria-selected': boolean
    'data-value': string
    'data-latest'?: string
  }
  /** Select a version */
  select: (value: string) => void
  /** Open the dropdown */
  open: () => void
  /** Close the dropdown */
  close: () => void
  /** Keyboard handler map */
  keyboardHandlers: KeyboardHandlerMap
  /** Pre-built keyboard event handler */
  handleKeyDown: (event: KeyboardEvent) => void
}

export function createVersionSelector(props: VersionSelectorProps): VersionSelectorAPI {
  const {
    value: initialValue = '',
    onValueChange,
    versions,
  } = props

  const contentId = generateId('rfr-ver-sel')

  let selectedVersion = initialValue
  let isOpen = false

  const state = { selectedVersion, isOpen }

  function setOpen(value: boolean) {
    isOpen = value
    state.isOpen = value
  }

  function select(value: string) {
    selectedVersion = value
    state.selectedVersion = value
    onValueChange?.(value)
    setOpen(false)
  }

  const triggerProps = {
    'aria-expanded': isOpen,
    'aria-controls': contentId,
    'aria-haspopup': 'listbox' as const,
    role: 'combobox' as const,
  }

  const contentProps = {
    role: 'listbox' as const,
    id: contentId,
  }

  function getOptionProps(value: string) {
    const version = versions.find((v) => v.value === value)
    const base = {
      role: 'option' as const,
      'aria-selected': selectedVersion === value,
      'data-value': value,
    }
    if (version?.isLatest) {
      return { ...base, 'data-latest': 'true' }
    }
    return base
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
    select,
    open: () => setOpen(true),
    close: () => setOpen(false),
    keyboardHandlers,
    handleKeyDown,
  }
}
