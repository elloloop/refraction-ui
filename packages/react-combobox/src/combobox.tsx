import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn, cva, generateId } from '@refraction-ui/shared'

/* ─── Types ────────────────────────────────────────────────────── */

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean

const defaultFilter: ComboboxFilter = (option, query) => {
  if (!query) return true
  return option.label.toLowerCase().includes(query.toLowerCase())
}

/* ─── Variants ─────────────────────────────────────────────────── */

export const comboboxTriggerVariants = cva({
  base: 'flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-8 text-xs',
      default: 'h-9 text-sm',
      lg: 'h-10 text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const comboboxContentVariants = cva({
  base: 'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
})

export const comboboxInputVariants = cva({
  base: 'flex h-9 w-full rounded-md border-0 border-b bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
})

export const comboboxListVariants = cva({
  base: 'max-h-[300px] overflow-y-auto overflow-x-hidden p-1',
})

export const comboboxItemVariants = cva({
  base: 'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  variants: {
    selected: {
      true: 'bg-accent/50 font-medium',
      false: '',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})

export const comboboxEmptyVariants = cva({
  base: 'py-6 text-center text-sm text-muted-foreground',
})

/* ─── Context ──────────────────────────────────────────────────── */

interface RegisteredItem {
  id: string
  value: string
  disabled: boolean
  label: string
}

interface ComboboxContextValue {
  value: string | undefined
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  query: string
  setQuery: (query: string) => void
  highlightedValue: string | undefined
  setHighlightedValue: (value: string | undefined) => void
  registerItem: (item: RegisteredItem) => void
  unregisterItem: (id: string) => void
  matches: (option: { value: string; label: string; disabled?: boolean }) => boolean
  itemMatchesQuery: (label: string, value: string, disabled: boolean) => boolean
  visibleCount: number
  setVisibleCount: (count: number) => void
  ids: {
    trigger: string
    content: string
    list: string
    input: string
    item: (value: string) => string
  }
  disabled: boolean
  options: ComboboxOption[]
  hasOptions: boolean
  filter: ComboboxFilter
  selectedLabel: string | undefined
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>
  contentRef: React.MutableRefObject<HTMLDivElement | null>
  inputRef: React.MutableRefObject<HTMLInputElement | null>
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

function useComboboxContext(): ComboboxContextValue {
  const ctx = React.useContext(ComboboxContext)
  if (!ctx) {
    throw new Error('Combobox compound components must be used within <Combobox>')
  }
  return ctx
}

/* ─── Combobox (root) ──────────────────────────────────────────── */

export interface ComboboxProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  options?: ComboboxOption[]
  filter?: ComboboxFilter
  disabled?: boolean
  children?: React.ReactNode
}

/**
 * Combobox -- searchable select with text-based filtering.
 *
 * Compound component:
 *   Combobox > ComboboxTrigger + ComboboxContent
 *   ComboboxContent > ComboboxInput + ComboboxList(ComboboxItem...) + ComboboxEmpty
 *
 * Supports both controlled (value/onValueChange) and uncontrolled (defaultValue) modes.
 * Options can be supplied via the `options` prop (auto-renders items) or by composing
 * <ComboboxItem> children inside <ComboboxList> for full control.
 */
export function Combobox({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  options,
  filter = defaultFilter,
  disabled = false,
  children,
}: ComboboxProps) {
  const isValueControlled = valueProp !== undefined
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue)
  const value = isValueControlled ? valueProp : internalValue

  const isOpenControlled = openProp !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = isOpenControlled ? openProp : internalOpen

  const [query, setQuery] = React.useState('')
  const [highlightedValue, setHighlightedValue] = React.useState<string | undefined>(undefined)
  const [registry, setRegistry] = React.useState<RegisteredItem[]>([])
  const [visibleCount, setVisibleCount] = React.useState(0)

  const idBaseRef = React.useRef<string>(generateId('combobox'))
  const idBase = idBaseRef.current

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (!isValueControlled) setInternalValue(next)
      onValueChange?.(next)
    },
    [isValueControlled, onValueChange],
  )

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (disabled && next) return
      if (!isOpenControlled) setInternalOpen(next)
      onOpenChange?.(next)
      if (!next) {
        // Reset query when closing
        setQuery('')
        setHighlightedValue(undefined)
      }
    },
    [disabled, isOpenControlled, onOpenChange],
  )

  const registerItem = React.useCallback((item: RegisteredItem) => {
    setRegistry((prev) => {
      const existing = prev.findIndex((i) => i.id === item.id)
      if (existing >= 0) {
        const next = prev.slice()
        next[existing] = item
        return next
      }
      return [...prev, item]
    })
  }, [])

  const unregisterItem = React.useCallback((id: string) => {
    setRegistry((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const itemMatchesQuery = React.useCallback(
    (label: string, itemValue: string, itemDisabled: boolean) => {
      return filter({ value: itemValue, label, disabled: itemDisabled }, query)
    },
    [filter, query],
  )

  const matches = React.useCallback(
    (option: { value: string; label: string; disabled?: boolean }) => {
      return filter(
        { value: option.value, label: option.label, disabled: option.disabled },
        query,
      )
    },
    [filter, query],
  )

  const selectedLabel = React.useMemo(() => {
    if (value === undefined) return undefined
    if (options) {
      const opt = options.find((o) => o.value === value)
      if (opt) return opt.label
    }
    const reg = registry.find((r) => r.value === value)
    return reg?.label
  }, [value, options, registry])

  const ids = React.useMemo(
    () => ({
      trigger: `${idBase}-trigger`,
      content: `${idBase}-content`,
      list: `${idBase}-list`,
      input: `${idBase}-input`,
      item: (v: string) => `${idBase}-item-${v}`,
    }),
    [idBase],
  )

  // Click-outside to close
  React.useEffect(() => {
    if (!open) return
    if (typeof document === 'undefined') return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (contentRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      handleOpenChange(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, handleOpenChange])

  // When opening, default highlight: selected value or first available
  React.useEffect(() => {
    if (!open) return
    if (highlightedValue !== undefined) return
    const candidates = registry.filter(
      (r) => !r.disabled && itemMatchesQuery(r.label, r.value, r.disabled),
    )
    if (candidates.length === 0) return
    const selected = candidates.find((r) => r.value === value)
    setHighlightedValue(selected ? selected.value : candidates[0].value)
  }, [open, highlightedValue, registry, value, itemMatchesQuery])

  // When query changes, reset highlight to first match
  React.useEffect(() => {
    if (!open) return
    const candidates = registry.filter(
      (r) => !r.disabled && itemMatchesQuery(r.label, r.value, r.disabled),
    )
    if (candidates.length === 0) {
      setHighlightedValue(undefined)
      return
    }
    if (
      highlightedValue === undefined ||
      !candidates.some((c) => c.value === highlightedValue)
    ) {
      setHighlightedValue(candidates[0].value)
    }
  }, [query, open, registry, itemMatchesQuery, highlightedValue])

  const ctx = React.useMemo<ComboboxContextValue>(
    () => ({
      value,
      onValueChange: handleValueChange,
      open,
      setOpen: handleOpenChange,
      query,
      setQuery,
      highlightedValue,
      setHighlightedValue,
      registerItem,
      unregisterItem,
      matches,
      itemMatchesQuery,
      visibleCount,
      setVisibleCount,
      ids,
      disabled,
      options: options ?? [],
      hasOptions: !!options,
      filter,
      selectedLabel,
      triggerRef,
      contentRef,
      inputRef,
    }),
    [
      value,
      handleValueChange,
      open,
      handleOpenChange,
      query,
      highlightedValue,
      registerItem,
      unregisterItem,
      matches,
      itemMatchesQuery,
      visibleCount,
      ids,
      disabled,
      options,
      filter,
      selectedLabel,
    ],
  )

  return (
    <ComboboxContext.Provider value={ctx}>{children}</ComboboxContext.Provider>
  )
}

Combobox.displayName = 'Combobox'

/* ─── ComboboxTrigger ──────────────────────────────────────────── */

export interface ComboboxTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'default' | 'lg'
  placeholder?: string
}

export const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  ComboboxTriggerProps
>(({ className, children, size = 'default', placeholder = 'Select…', ...props }, forwardedRef) => {
  const ctx = useComboboxContext()
  const { open, setOpen, disabled, ids, selectedLabel, triggerRef } = ctx

  const ref = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef, triggerRef],
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    setOpen(!open)
    props.onClick?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(!open)
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
      }
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) {
      e.preventDefault()
      setOpen(true)
    }
    props.onKeyDown?.(e)
  }

  const label = children ?? selectedLabel ?? placeholder
  const isPlaceholder = !children && selectedLabel === undefined

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      id={ids.trigger}
      role="combobox"
      aria-expanded={open}
      aria-controls={ids.content}
      aria-haspopup="listbox"
      aria-disabled={disabled || undefined}
      data-state={open ? 'open' : 'closed'}
      data-placeholder={isPlaceholder ? '' : undefined}
      disabled={disabled}
      className={cn(comboboxTriggerVariants({ size }), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className={cn('truncate', isPlaceholder && 'text-muted-foreground')}>
        {label}
      </span>
      <svg
        className="h-4 w-4 opacity-50 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
})
ComboboxTrigger.displayName = 'ComboboxTrigger'

/* ─── ComboboxContent ──────────────────────────────────────────── */

export interface ComboboxContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render content inside a portal (defaults true). */
  portal?: boolean
}

export const ComboboxContent = React.forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ className, children, portal = true, ...props }, forwardedRef) => {
    const ctx = useComboboxContext()
    const { open, ids, contentRef, hasOptions, options, inputRef } = ctx

    const ref = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef, contentRef],
    )

    React.useEffect(() => {
      if (open) {
        // Auto-focus the input when opening
        const t = setTimeout(() => inputRef.current?.focus(), 0)
        return () => clearTimeout(t)
      }
    }, [open, inputRef])

    if (!open) return null

    // If options were supplied via prop and no list children given, render a default list
    const content = (
      <div
        {...props}
        ref={ref}
        id={ids.content}
        data-state={open ? 'open' : 'closed'}
        className={cn(comboboxContentVariants(), className)}
      >
        {children ?? (
          <>
            <ComboboxInput />
            <ComboboxList>
              {hasOptions
                ? options.map((opt) => (
                    <ComboboxItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                    >
                      {opt.label}
                    </ComboboxItem>
                  ))
                : null}
            </ComboboxList>
            <ComboboxEmpty>No results.</ComboboxEmpty>
          </>
        )}
      </div>
    )

    if (portal && typeof document !== 'undefined') {
      return createPortal(content, document.body)
    }
    return content
  },
)
ComboboxContent.displayName = 'ComboboxContent'

/* ─── ComboboxInput ────────────────────────────────────────────── */

export interface ComboboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ className, onChange, onKeyDown, placeholder = 'Search…', ...props }, forwardedRef) => {
    const ctx = useComboboxContext()
    const {
      query,
      setQuery,
      ids,
      open,
      setOpen,
      highlightedValue,
      setHighlightedValue,
      onValueChange,
      itemMatchesQuery,
      inputRef,
      triggerRef,
    } = ctx

    const ref = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef, inputRef],
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
      onChange?.(e)
    }

    const getCandidates = (): { value: string; label: string }[] => {
      // Read DOM order from the registry — but registry is in context.
      // Re-derive from contentRef DOM order for stable navigation.
      const root = ctx.contentRef.current
      if (!root) return []
      const els = Array.from(
        root.querySelectorAll<HTMLElement>(
          '[role="option"]:not([data-disabled]):not([data-hidden])',
        ),
      )
      return els.map((el) => ({
        value: el.getAttribute('data-value') ?? '',
        label: el.textContent ?? '',
      }))
    }

    const moveHighlight = (delta: number) => {
      const candidates = getCandidates()
      if (candidates.length === 0) {
        setHighlightedValue(undefined)
        return
      }
      const idx = candidates.findIndex((c) => c.value === highlightedValue)
      let next: number
      if (idx === -1) {
        next = delta > 0 ? 0 : candidates.length - 1
      } else {
        next = (idx + delta + candidates.length) % candidates.length
      }
      setHighlightedValue(candidates[next].value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        moveHighlight(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        moveHighlight(-1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        const candidates = getCandidates()
        if (candidates.length) setHighlightedValue(candidates[0].value)
      } else if (e.key === 'End') {
        e.preventDefault()
        const candidates = getCandidates()
        if (candidates.length) setHighlightedValue(candidates[candidates.length - 1].value)
      } else if (e.key === 'Enter') {
        if (highlightedValue !== undefined) {
          e.preventDefault()
          onValueChange(highlightedValue)
          setOpen(false)
          setTimeout(() => triggerRef.current?.focus(), 0)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        setTimeout(() => triggerRef.current?.focus(), 0)
      } else if (e.key === 'Tab') {
        setOpen(false)
      }
      onKeyDown?.(e)
    }

    // Suppress unused warning for itemMatchesQuery (used elsewhere via ctx)
    void itemMatchesQuery
    void open

    return (
      <input
        {...props}
        ref={ref}
        id={ids.input}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={ids.list}
        aria-activedescendant={highlightedValue ? ids.item(highlightedValue) : undefined}
        value={query}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(comboboxInputVariants(), className)}
      />
    )
  },
)
ComboboxInput.displayName = 'ComboboxInput'

/* ─── ComboboxList ─────────────────────────────────────────────── */

export interface ComboboxListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ComboboxList = React.forwardRef<HTMLDivElement, ComboboxListProps>(
  ({ className, children, ...props }, ref) => {
    const { ids } = useComboboxContext()
    return (
      <div
        {...props}
        ref={ref}
        id={ids.list}
        role="listbox"
        className={cn(comboboxListVariants(), className)}
      >
        {children}
      </div>
    )
  },
)
ComboboxList.displayName = 'ComboboxList'

/* ─── ComboboxItem ─────────────────────────────────────────────── */

export interface ComboboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
  /** Override the label used for filtering (defaults to children text). */
  label?: string
}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  (
    { className, children, value: itemValue, disabled: itemDisabled = false, label, ...props },
    ref,
  ) => {
    const ctx = useComboboxContext()
    const {
      value,
      onValueChange,
      setOpen,
      highlightedValue,
      setHighlightedValue,
      registerItem,
      unregisterItem,
      itemMatchesQuery,
      ids,
      triggerRef,
    } = ctx

    const isSelected = value === itemValue
    const itemId = ids.item(itemValue)
    const labelText =
      label ?? (typeof children === 'string' ? children : itemValue)

    React.useEffect(() => {
      registerItem({ id: itemId, value: itemValue, disabled: itemDisabled, label: labelText })
      return () => unregisterItem(itemId)
    }, [itemId, itemValue, itemDisabled, labelText, registerItem, unregisterItem])

    const matches = itemMatchesQuery(labelText, itemValue, itemDisabled)
    const isHighlighted = highlightedValue === itemValue && matches && !itemDisabled

    const handleClick = () => {
      if (itemDisabled) return
      onValueChange(itemValue)
      setOpen(false)
      setTimeout(() => triggerRef.current?.focus(), 0)
    }

    const handlePointerMove = () => {
      if (itemDisabled) return
      if (highlightedValue !== itemValue) setHighlightedValue(itemValue)
    }

    if (!matches) {
      // Render a hidden placeholder so DOM still contains the option for stable IDs but
      // it is excluded from listbox navigation/queries.
      return (
        <div
          ref={ref}
          id={itemId}
          data-value={itemValue}
          data-hidden=""
          hidden
          aria-hidden="true"
        />
      )
    }

    return (
      <div
        {...props}
        ref={ref}
        id={itemId}
        role="option"
        aria-selected={isSelected}
        aria-disabled={itemDisabled || undefined}
        data-value={itemValue}
        data-state={isSelected ? 'checked' : undefined}
        data-highlighted={isHighlighted ? '' : undefined}
        data-disabled={itemDisabled ? '' : undefined}
        className={cn(
          comboboxItemVariants({ selected: isSelected ? 'true' : 'false' }),
          className,
        )}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
      >
        {children}
      </div>
    )
  },
)
ComboboxItem.displayName = 'ComboboxItem'

/* ─── ComboboxEmpty ────────────────────────────────────────────── */

export interface ComboboxEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useComboboxContext()
    const { contentRef, query, options, hasOptions, filter } = ctx

    // Determine whether any option matches.
    // For options-prop mode: filter the prop array.
    // For compound mode: read the DOM in a layout effect.
    const [hasVisible, setHasVisible] = React.useState(true)

    React.useEffect(() => {
      if (hasOptions) {
        const visible = options.some((o) =>
          filter({ value: o.value, label: o.label, disabled: o.disabled }, query),
        )
        setHasVisible(visible)
        return
      }
      const root = contentRef.current
      if (!root) {
        setHasVisible(true)
        return
      }
      const els = root.querySelectorAll('[role="option"]:not([data-hidden])')
      setHasVisible(els.length > 0)
    })

    if (hasVisible) return null

    return (
      <div
        {...props}
        ref={ref}
        role="presentation"
        className={cn(comboboxEmptyVariants(), className)}
      >
        {children ?? 'No results.'}
      </div>
    )
  },
)
ComboboxEmpty.displayName = 'ComboboxEmpty'
