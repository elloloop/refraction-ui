import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'

interface TabsContextValue {
  active: string
  setActive: (v: string) => void
  orientation: 'horizontal' | 'vertical'
  registerTab: (value: string, ref: HTMLButtonElement | null, disabled: boolean) => void
  tabsRef: React.MutableRefObject<Array<{ value: string; ref: HTMLButtonElement | null; disabled: boolean }>>
  indicator: React.ReactNode
  animated: boolean
  lazy: boolean
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  indicator?: React.ReactNode
  animated?: boolean
  lazy?: boolean
  urlSync?: boolean
  children: React.ReactNode
  className?: string
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  indicator = <div className="r-tabs-indicator" />,
  animated = true,
  lazy = false,
  urlSync = false,
  children,
  className
}: TabsProps) {
  const isControlled = value !== undefined
  const initial = () => {
    if (isControlled) return value as string
    if (urlSync && typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash) return hash
    }
    return defaultValue || ''
  }

  const [active, setActive] = useState(initial)
  const tabsRef = useRef<Array<{ value: string; ref: HTMLButtonElement | null; disabled: boolean }>>([])
  const registerTab = useCallback((v: string, ref: HTMLButtonElement | null, disabled: boolean) => {
    const existing = tabsRef.current.find(t => t.value === v)
    if (existing) {
      existing.ref = ref
      existing.disabled = disabled
    } else {
      tabsRef.current.push({ value: v, ref, disabled })
    }
  }, [])

  const setActiveValue = useCallback(
    (v: string) => {
      if (!isControlled) setActive(v)
      onValueChange?.(v)
      if (urlSync && typeof window !== 'undefined') {
        window.location.hash = v
      }
    },
    [isControlled, onValueChange, urlSync]
  )

  useEffect(() => {
    if (isControlled && value !== active) {
      setActive(value as string)
    }
  }, [isControlled, value, active])

  const contextValue: TabsContextValue = {
    active,
    setActive: setActiveValue,
    orientation,
    registerTab,
    tabsRef,
    indicator,
    animated,
    lazy
  }

  const role = orientation === 'vertical' ? 'tablist' : 'tablist'

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className} role={role} aria-orientation={orientation}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabProps {
  children: React.ReactNode
  value: string
  disabled?: boolean
  className?: string
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { children, value, disabled = false, className },
  ref
) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tab must be used within Tabs')
  const { active, setActive, orientation, registerTab, animated } = ctx
  const internalRef = useRef<HTMLButtonElement | null>(null)
  const combinedRef = (node: HTMLButtonElement | null) => {
    internalRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
    registerTab(value, node, disabled)
  }
  const selected = active === value
  const handleClick = () => {
    if (!disabled) setActive(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusTab(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusTab(ctx.tabsRef.current.length - 1)
    }
  }

  const move = (delta: number) => {
    const enabled = ctx.tabsRef.current.filter(t => !t.disabled)
    const index = enabled.findIndex(t => t.value === value)
    const next = enabled[index + delta]
    if (next && next.ref) {
      next.ref.focus()
      setActive(next.value)
    }
  }

  const focusTab = (idx: number) => {
    const enabled = ctx.tabsRef.current.filter(t => !t.disabled)
    const tab = enabled[idx]
    if (tab && tab.ref) {
      tab.ref.focus()
      setActive(tab.value)
    }
  }

  const style = animated ? { transition: 'color 0.2s' } : undefined

  return (
    <button
      ref={combinedRef}
      role="tab"
      aria-selected={selected}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={className}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-state={selected ? 'active' : 'inactive'}
      data-disabled={disabled ? 'true' : undefined}
    >
      {children}
    </button>
  )
})

export interface TabPanelProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabPanel: React.FC<TabPanelProps> = ({ value, children, className }) => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabPanel must be used within Tabs')
  const { active, lazy, animated } = ctx
  const selected = active === value

  const style = animated ? { transition: 'opacity 0.2s', opacity: selected ? 1 : 0 } : undefined

  if (lazy && !selected) {
    return <div role="tabpanel" id={`panel-${value}`} aria-labelledby={`tab-${value}`} hidden />
  }
  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!selected}
      className={className}
      style={style}
    >
      {(!lazy || selected) && children}
    </div>
  )
}

export interface TabListProps {
  children: React.ReactNode
  className?: string
  indicatorClassName?: string
}

export const TabList: React.FC<TabListProps> = ({ children, className, indicatorClassName }) => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabList must be used within Tabs')
  const { active, indicator, orientation, animated } = ctx
  const listRef = useRef<HTMLDivElement | null>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    const idx = tabs.findIndex(t => t.id === `tab-${active}`)
    if (idx === -1) return
    const tab = tabs[idx]
    if (!tab) return
    const rect = tab.getBoundingClientRect()
    if (orientation === 'vertical') {
      setStyle({ transform: `translateY(${tab.offsetTop}px)`, height: rect.height })
    } else {
      setStyle({ transform: `translateX(${tab.offsetLeft}px)`, width: rect.width })
    }
  }, [active, orientation])

  const indStyle = animated ? { transition: 'transform 0.2s, width 0.2s, height 0.2s', ...style } : style

  return (
    <div ref={listRef} role="tablist" aria-orientation={orientation} className={className}>
      {children}
      {React.isValidElement(indicator) &&
        React.cloneElement(indicator as React.ReactElement, {
          className: indicatorClassName,
          style: indStyle
        })}
    </div>
  )
}
