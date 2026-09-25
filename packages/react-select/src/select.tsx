import * as React from 'react'
import {
  createSelect,
  selectTriggerVariants,
  selectContentVariants,
  selectItemVariants,
  selectRootClass,
  selectValueClass,
  type SelectOption,
} from '@refraction-ui/select'
import { cn, devWarn } from '@refraction-ui/shared'

/* ─── Context ──────────────────────────────────────────────────── */
interface SelectContextValue {
  value: string | undefined
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  options: SelectOption[]
  disabled: boolean
  placeholder: string
  triggerId: string
  contentId: string
  /** Label of each item by value, for `SelectValue`. */
  labels: ReadonlyMap<string, React.ReactNode>
  /** Mounted items report their label so `SelectValue` can show it. */
  registerLabel: (value: string, label: React.ReactNode) => void
  /**
   * Internal marker: `true` only on the context *default* (i.e. no `<Select>`
   * provider above this part). `<Select>` always supplies a value without
   * this flag. Used purely to detect the silent-default footgun — never read
   * for rendering.
   *
   * @internal
   */
  __isDefault?: boolean
}

const SelectContext = React.createContext<SelectContextValue>({
  __isDefault: true,
  value: undefined,
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  options: [],
  disabled: false,
  placeholder: 'Select an option',
  triggerId: '',
  contentId: '',
  labels: new Map(),
  registerLabel: () => {},
})

/**
 * Read the select context for a compound part (`SelectTrigger`,
 * `SelectContent`, `SelectItem`).
 *
 * Footgun seam (epic #254 / #256, policy: `silent-default-context`): when a
 * part is rendered without a `<Select>` ancestor it silently reads inert
 * context defaults (no-op handlers, empty ids, never-open) and renders a dead
 * control with no error. There is no throw today and adding one would be a
 * breaking change, so per `docs/instrumentation/policy.md` a dev-only
 * `devWarn` is the *only* signal. Stripped in production, warn-once.
 *
 * Behaviour is unchanged: the default context value is still returned.
 */
function useSelectContext(part: string): SelectContextValue {
  const ctx = React.useContext(SelectContext)
  if (ctx.__isDefault) {
    devWarn(
      'react-select/no-select-provider',
      `<${part}> was rendered without a <Select> ancestor. It is silently ` +
        'reading inert context defaults (clicks/keyboard do nothing, it never ' +
        'opens). Wrap it in <Select>…</Select>.',
    )
  }
  return ctx
}

/* ─── Select (root) ────────────────────────────────────────────── */
export interface SelectProps {
  /** Selected value (controlled). */
  value?: string
  /** Initially selected value (uncontrolled). */
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children?: React.ReactNode
  /** Shown by `SelectValue` while nothing is selected. */
  placeholder?: string
  /** Class for the positioning wrapper the select renders around its parts. */
  className?: string
}

/**
 * Collect `value → label` for every `SelectItem` in the element tree, so the
 * trigger can show the selected label while the list is closed (items only
 * mount while open). Items nested inside custom components are not visible
 * here; those register their label when they first mount.
 */
function collectItemLabels(
  node: React.ReactNode,
  into: Map<string, React.ReactNode>,
): Map<string, React.ReactNode> {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement<{ value?: unknown; children?: React.ReactNode }>(child)) return
    if (child.type === SelectItem && typeof child.props.value === 'string') {
      into.set(child.props.value, child.props.children)
      return
    }
    collectItemLabels(child.props.children, into)
  })
  return into
}

/**
 * Select -- dropdown select with accessible keyboard and ARIA support.
 * Compound component: Select > SelectTrigger (> SelectValue) + SelectContent > SelectItem.
 * Renders a `relative` wrapper so the listbox floats under the trigger, and
 * closes on a pointer press outside it.
 */
export function Select({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  children,
  placeholder = 'Select an option',
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue
  const rootRef = React.useRef<HTMLDivElement>(null)

  // Stable across renders and SSR-safe (the core's generateId is per-call).
  const baseId = React.useId()
  const triggerId = `${baseId}-trigger`
  const contentId = `${baseId}-content`

  const [registered, setRegistered] = React.useState<ReadonlyMap<string, React.ReactNode>>(
    () => new Map(),
  )
  const registerLabel = React.useCallback((itemValue: string, label: React.ReactNode) => {
    setRegistered((prev) => {
      if (prev.get(itemValue) === label) return prev
      const next = new Map(prev)
      next.set(itemValue, label)
      return next
    })
  }, [])
  const labels = React.useMemo(
    () => collectItemLabels(children, new Map(registered)),
    [children, registered],
  )

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen: (v) => {
          if (!disabled) setOpen(v)
        },
        options: [],
        disabled,
        placeholder,
        triggerId,
        contentId,
        labels,
        registerLabel,
      }}
    >
      <div ref={rootRef} className={cn(selectRootClass, className)} data-slot="select">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

/* ─── SelectTrigger ────────────────────────────────────────────── */
export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'default' | 'lg'
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger({ className, children, size = 'default', ...props }, ref) {
    const { open, setOpen, disabled, triggerId, contentId } = useSelectContext('SelectTrigger')

    const api = createSelect({ disabled, open, ids: { trigger: triggerId, content: contentId } })

    const handleClick = () => {
      if (!disabled) {
        setOpen(!open)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!disabled) setOpen(!open)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) {
        e.preventDefault()
        if (!disabled) setOpen(true)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        id={triggerId}
        className={cn(selectTriggerVariants({ size }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...api.triggerProps.ariaProps}
        {...api.triggerProps.dataAttributes}
        {...props}
      >
        {children}
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
  },
)

/* ─── SelectContent ────────────────────────────────────────────── */
export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent({ className, children, ...props }, forwardedRef) {
    const { open, contentId, triggerId, setOpen } = useSelectContext('SelectContent')
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Merge refs
    const ref = React.useCallback(
      (node: HTMLDivElement) => {
        containerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef]
    )

    React.useEffect(() => {
      if (open && containerRef.current) {
        const firstOption = containerRef.current.querySelector('[role="option"]:not([aria-disabled="true"])') as HTMLElement
        if (firstOption) {
          // Delay focus slightly to ensure DOM is ready
          setTimeout(() => firstOption.focus(), 0)
        }
      }
    }, [open])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      const options = Array.from(
        containerRef.current.querySelectorAll('[role="option"]:not([aria-disabled="true"])')
      ) as HTMLElement[]

      if (!options.length) return

      const currentIndex = options.indexOf(document.activeElement as HTMLElement)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
        options[nextIndex]?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
        options[prevIndex]?.focus()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        // Focus back to trigger
        const trigger = document.getElementById(triggerId)
        if (trigger) trigger.focus()
      }
    }

    if (!open) return null

    return (
      <div
        ref={ref}
        id={contentId}
        className={cn(selectContentVariants(), className)}
        role="listbox"
        aria-labelledby={triggerId}
        data-state={open ? 'open' : 'closed'}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    )
  },
)

/* ─── SelectItem ───────────────────────────────────────────────── */
export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem({ className, children, value: itemValue, disabled: itemDisabled = false, ...props }, ref) {
    const { value, onValueChange, setOpen, triggerId, registerLabel } = useSelectContext('SelectItem')
    const isSelected = value === itemValue

    React.useEffect(() => {
      registerLabel(itemValue, children)
    }, [registerLabel, itemValue, children])

    const handleClick = () => {
      if (!itemDisabled) {
        onValueChange(itemValue)
        setOpen(false)
        const trigger = document.getElementById(triggerId)
        if (trigger) setTimeout(() => trigger.focus(), 0)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && !itemDisabled) {
        e.preventDefault()
        onValueChange(itemValue)
        setOpen(false)
        const trigger = document.getElementById(triggerId)
        if (trigger) setTimeout(() => trigger.focus(), 0)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(selectItemVariants({ selected: isSelected ? 'true' : 'false' }), className)}
        role="option"
        aria-selected={isSelected}
        aria-disabled={itemDisabled || undefined}
        data-state={isSelected ? 'checked' : undefined}
        data-disabled={itemDisabled ? '' : undefined}
        tabIndex={itemDisabled ? undefined : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {isSelected && (
          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        )}
        {children}
      </div>
    )
  },
)

/* ─── SelectValue ──────────────────────────────────────────────── */
export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Shown while nothing is selected. Defaults to the `Select` placeholder. */
  placeholder?: React.ReactNode
}

/**
 * SelectValue -- place inside `SelectTrigger` to show the selected item's
 * label (its `SelectItem` children), or the placeholder when nothing is
 * selected. Pass `children` to render the value yourself.
 */
export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  function SelectValue({ placeholder, className, children, ...props }, ref) {
    const ctx = useSelectContext('SelectValue')
    const label = ctx.value !== undefined ? ctx.labels.get(ctx.value) : undefined
    const showPlaceholder = children == null && label === undefined
    return (
      <span
        ref={ref}
        className={cn(selectValueClass, className)}
        data-placeholder={showPlaceholder ? '' : undefined}
        {...props}
      >
        {children ?? (showPlaceholder ? (placeholder ?? ctx.placeholder) : label)}
      </span>
    )
  },
)
