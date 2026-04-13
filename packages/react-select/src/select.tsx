import * as React from 'react'
import {
  createSelect,
  selectTriggerVariants,
  selectContentVariants,
  selectItemVariants,
  type SelectOption,
} from '@refraction-ui/select'
import { cn } from '@refraction-ui/shared'

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
}

const SelectContext = React.createContext<SelectContextValue>({
  value: undefined,
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  options: [],
  disabled: false,
  placeholder: 'Select an option',
  triggerId: '',
  contentId: '',
})

/* ─── Select (root) ────────────────────────────────────────────── */
export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children?: React.ReactNode
  placeholder?: string
}

/**
 * Select -- dropdown select with accessible keyboard and ARIA support.
 * Compound component: Select > SelectTrigger + SelectContent > SelectItem.
 */
export function Select({
  value,
  onValueChange,
  disabled = false,
  children,
  placeholder = 'Select an option',
}: SelectProps) {
  const [open, setOpen] = React.useState(false)

  const api = createSelect({ value, disabled, open, placeholder })

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: onValueChange ?? (() => {}),
        open,
        setOpen: (v) => {
          if (!disabled) setOpen(v)
        },
        options: [],
        disabled,
        placeholder,
        triggerId: api.ids.trigger,
        contentId: api.ids.content,
      }}
    >
      {children}
    </SelectContext.Provider>
  )
}

/* ─── SelectTrigger ────────────────────────────────────────────── */
export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'default' | 'lg'
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, size = 'default', ...props }, ref) => {
    const { open, setOpen, disabled, triggerId, contentId } = React.useContext(SelectContext)

    const api = createSelect({ disabled, open })

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
        aria-controls={contentId}
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
SelectTrigger.displayName = 'SelectTrigger'

/* ─── SelectContent ────────────────────────────────────────────── */
export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, forwardedRef) => {
    const { open, contentId, triggerId, setOpen } = React.useContext(SelectContext)
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
SelectContent.displayName = 'SelectContent'

/* ─── SelectItem ───────────────────────────────────────────────── */
export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value: itemValue, disabled: itemDisabled = false, ...props }, ref) => {
    const { value, onValueChange, setOpen, triggerId } = React.useContext(SelectContext)
    const isSelected = value === itemValue

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
SelectItem.displayName = 'SelectItem'
