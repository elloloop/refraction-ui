import type { AccessibilityProps, KeyboardHandlerMap } from '@refraction-ui/shared'
import { Keys, generateId } from '@refraction-ui/shared'

export interface TabsProps {
  /** The active tab value (controlled) */
  value?: string
  /** The default active tab value (uncontrolled) */
  defaultValue?: string
  /** Callback when active tab changes */
  onValueChange?: (value: string) => void
  /** Orientation of the tab list */
  orientation?: 'horizontal' | 'vertical'
}

export interface TabsState {
  activeValue: string
}

export interface TabsAPI {
  /** Current tabs state */
  state: TabsState
  /** ARIA attributes for the tab list */
  listProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Factory for individual tab trigger props */
  getTabProps(value: string): Partial<AccessibilityProps> & Record<string, unknown>
  /** Factory for individual tab panel props */
  getPanelProps(value: string): Partial<AccessibilityProps> & Record<string, unknown>
  /** Select a tab by value */
  select(value: string): void
  /** Keyboard handlers for the tab list */
  keyboardHandlers: KeyboardHandlerMap
  /** Generated ID prefix for aria linking */
  idPrefix: string
}

export function createTabs(props: TabsProps = {}): TabsAPI {
  const {
    value: controlledValue,
    defaultValue = '',
    onValueChange,
    orientation = 'horizontal',
  } = props

  let uncontrolledValue = controlledValue ?? defaultValue
  const idPrefix = generateId('rfr-tabs')

  function getActiveValue(): string {
    if (controlledValue !== undefined) return controlledValue
    return uncontrolledValue
  }

  function select(value: string): void {
    uncontrolledValue = value
    onValueChange?.(value)
  }

  function getTabId(value: string): string {
    return `${idPrefix}-tab-${value}`
  }

  function getPanelId(value: string): string {
    return `${idPrefix}-panel-${value}`
  }

  function getTabProps(value: string): Partial<AccessibilityProps> & Record<string, unknown> {
    const isSelected = getActiveValue() === value
    return {
      role: 'tab',
      'aria-selected': isSelected,
      'aria-controls': getPanelId(value),
      tabIndex: isSelected ? 0 : -1,
      id: getTabId(value),
      'data-state': isSelected ? 'active' : 'inactive',
    }
  }

  function getPanelProps(value: string): Partial<AccessibilityProps> & Record<string, unknown> {
    const isSelected = getActiveValue() === value
    return {
      role: 'tabpanel',
      'aria-labelledby': getTabId(value),
      id: getPanelId(value),
      hidden: !isSelected || undefined,
      tabIndex: 0,
      'data-state': isSelected ? 'active' : 'inactive',
    }
  }

  const listProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'tablist',
    'aria-orientation': orientation,
  }

  const keyboardHandlers: KeyboardHandlerMap = orientation === 'horizontal'
    ? {
        [Keys.ArrowLeft]: (e) => {
          e.preventDefault()
        },
        [Keys.ArrowRight]: (e) => {
          e.preventDefault()
        },
        [Keys.Home]: (e) => {
          e.preventDefault()
        },
        [Keys.End]: (e) => {
          e.preventDefault()
        },
      }
    : {
        [Keys.ArrowUp]: (e) => {
          e.preventDefault()
        },
        [Keys.ArrowDown]: (e) => {
          e.preventDefault()
        },
        [Keys.Home]: (e) => {
          e.preventDefault()
        },
        [Keys.End]: (e) => {
          e.preventDefault()
        },
      }

  return {
    state: { activeValue: getActiveValue() },
    listProps,
    getTabProps,
    getPanelProps,
    select,
    keyboardHandlers,
    idPrefix,
  }
}
