import * as React from 'react'
import {
  createTabs,
  tabsListVariants,
  tabsTriggerVariants,
  type TabsProps as CoreTabsProps,
} from '@elloloop/tabs'
import { cn, createKeyboardHandler, Keys } from '@elloloop/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  orientation: 'horizontal' | 'vertical'
  idPrefix: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext(): TabsContextValue {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    throw new Error('Tabs compound components must be used within <Tabs>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Tabs (root provider)
// ---------------------------------------------------------------------------

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children?: React.ReactNode
}

export function Tabs({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next)
      }
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  // Use the headless core to get stable IDs
  const apiRef = React.useRef<ReturnType<typeof createTabs> | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createTabs({ value, orientation })
  }
  const api = apiRef.current

  const ctx = React.useMemo<TabsContextValue>(
    () => ({
      value,
      onValueChange: handleValueChange,
      orientation,
      idPrefix: api.idPrefix,
    }),
    [value, handleValueChange, orientation, api.idPrefix],
  )

  return React.createElement(
    'div',
    { className, 'data-orientation': orientation },
    React.createElement(TabsContext.Provider, { value: ctx }, children),
  )
}

Tabs.displayName = 'Tabs'

// ---------------------------------------------------------------------------
// TabsList
// ---------------------------------------------------------------------------

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useTabsContext()

    return React.createElement('div', {
      ref,
      role: 'tablist',
      'aria-orientation': orientation,
      className: cn(tabsListVariants(), className),
      ...props,
    })
  },
)

TabsList.displayName = 'TabsList'

// ---------------------------------------------------------------------------
// TabsTrigger
// ---------------------------------------------------------------------------

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, onClick, onKeyDown, children, ...props }, ref) => {
    const { value: activeValue, onValueChange, orientation, idPrefix } = useTabsContext()

    const isSelected = activeValue === value
    const tabId = `${idPrefix}-tab-${value}`
    const panelId = `${idPrefix}-panel-${value}`

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onValueChange(value)
      onClick?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Navigation keys are handled at the list level by convention,
      // but we expose them here for convenience in SSR-only scenarios
      onKeyDown?.(e)
    }

    return React.createElement(
      'button',
      {
        ref,
        type: 'button',
        role: 'tab',
        'aria-selected': isSelected,
        'aria-controls': panelId,
        tabIndex: isSelected ? 0 : -1,
        id: tabId,
        'data-state': isSelected ? 'active' : 'inactive',
        className: cn(tabsTriggerVariants(), className),
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        ...props,
      },
      children,
    )
  },
)

TabsTrigger.displayName = 'TabsTrigger'

// ---------------------------------------------------------------------------
// TabsContent
// ---------------------------------------------------------------------------

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: activeValue, idPrefix } = useTabsContext()

    const isSelected = activeValue === value
    const tabId = `${idPrefix}-tab-${value}`
    const panelId = `${idPrefix}-panel-${value}`

    if (!isSelected) return null

    return React.createElement(
      'div',
      {
        ref,
        role: 'tabpanel',
        'aria-labelledby': tabId,
        id: panelId,
        tabIndex: 0,
        'data-state': 'active',
        className,
        ...props,
      },
      children,
    )
  },
)

TabsContent.displayName = 'TabsContent'
