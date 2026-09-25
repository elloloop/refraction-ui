import * as React from 'react'
import {
  createTabs,
  getNextTabIndex,
  tabsListVariants,
  tabsTriggerVariants,
  type TabsProps as CoreTabsProps,
} from '@refraction-ui/tabs'
import { cn, createKeyboardHandler, Keys, devWarn } from '@refraction-ui/shared'

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
    devWarn(
      'react-tabs/context-outside-provider',
      'Tabs compound components (TabsList/TabsTrigger/TabsContent) must be rendered inside a <Tabs>. The missing TabsContext makes this throw.',
    )
    throw new Error('Tabs compound components must be used within <Tabs>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Tabs (root provider)
// ---------------------------------------------------------------------------

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children?: React.ReactNode
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  function Tabs({ value: controlledValue, defaultValue = '', onValueChange, orientation = 'horizontal', className, children, ...props }: TabsProps, ref) {
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
    { ref, className, 'data-orientation': orientation, ...props },
    React.createElement(TabsContext.Provider, { value: ctx }, children),
  )
  },
)

// ---------------------------------------------------------------------------
// TabsList
// ---------------------------------------------------------------------------

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ className, onKeyDown, ...props }, forwardedRef) {
    const { orientation } = useTabsContext()
    const listRef = React.useRef<HTMLDivElement | null>(null)
    const ref = React.useCallback(
      (node: HTMLDivElement | null) => {
        listRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef],
    )

    // Roving tabindex needs exactly one tab stop. A trigger only knows whether
    // IT is selected, so when no enabled trigger matches the value (no
    // defaultValue, or the selected tab is disabled) nothing would be
    // tabbable; make the first enabled tab the stop in that case.
    // This effect owns the final tabindex of every trigger (React leaves a
    // DOM value alone while its prop is unchanged, so patching only the
    // fallback would leave two tab stops after the next selection).
    React.useEffect(() => {
      const tabs = enabledTabs(listRef.current)
      const stop = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0]
      for (const tab of tabs) tab.tabIndex = tab === stop ? 0 : -1
    })

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e)
      if (e.defaultPrevented) return
      const tabs = enabledTabs(listRef.current)
      const current = tabs.indexOf(e.target as HTMLButtonElement)
      if (current === -1) return
      const next = getNextTabIndex(current, e.key, tabs.length, orientation)
      if (next === null) return
      e.preventDefault()
      tabs[next].focus()
      // Automatic activation: moving focus selects the tab.
      tabs[next].click()
    }

    return React.createElement('div', {
      ref,
      role: 'tablist',
      'aria-orientation': orientation,
      className: cn(tabsListVariants(), className),
      onKeyDown: handleKeyDown,
      ...props,
    })
  },
)

function enabledTabs(list: HTMLElement | null): HTMLButtonElement[] {
  if (!list) return []
  return Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'))
}

// ---------------------------------------------------------------------------
// TabsTrigger
// ---------------------------------------------------------------------------

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ value, className, onClick, onKeyDown, children, ...props }, ref) {
    const { value: activeValue, onValueChange, orientation, idPrefix } = useTabsContext()

    const isSelected = activeValue === value
    const tabId = `${idPrefix}-tab-${value}`
    const panelId = `${idPrefix}-panel-${value}`

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onValueChange(value)
      onClick?.(e)
    }

    // Arrow / Home / End navigation is handled by TabsList (roving focus);
    // a consumer onKeyDown runs first and can preventDefault to opt out.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
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

// ---------------------------------------------------------------------------
// TabsContent
// ---------------------------------------------------------------------------

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ value, className, children, ...props }, ref) {
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
