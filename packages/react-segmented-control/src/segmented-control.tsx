import * as React from 'react'
import {
  createSegmentedControl,
  getNextSegmentIndex,
  segmentedControlVariants,
  segmentedControlItemVariants,
  type SegmentedControlSize,
} from '@refraction-ui/segmented-control'
import { cn } from '@refraction-ui/shared'

export type { SegmentedControlSize }

interface SegmentedControlContextValue {
  value: string | undefined
  size: SegmentedControlSize
  select: (value: string) => void
  /** Register an item's value + focus handler; returns an unregister fn. */
  register: (value: string, focus: () => void) => () => void
  /** Move selection/focus relative to the given item value via a keyboard key. */
  move: (from: string, key: string) => void
}

const SegmentedControlContext =
  React.createContext<SegmentedControlContextValue | null>(null)

function useSegmentedControlContext(component: string) {
  const ctx = React.useContext(SegmentedControlContext)
  if (!ctx) {
    throw new Error(`<${component}> must be used within <SegmentedControl>`)
  }
  return ctx
}

export interface SegmentedControlProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onChange' | 'defaultValue'
  > {
  /** Controlled selected item value. */
  value?: string
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string
  /** Called with the newly selected item value. */
  onValueChange?: (value: string) => void
  /** Visual size of the control. */
  size?: SegmentedControlSize
}

interface ItemRegistration {
  value: string
  focus: () => void
}

/**
 * SegmentedControl — a pill-shaped single-select control with radio semantics.
 *
 * Renders `role="radiogroup"`; each {@link SegmentedControlItem} is a
 * `role="radio"`. Supports controlled (`value`/`onValueChange`) and
 * uncontrolled (`defaultValue`) usage, roving tabindex, arrow-key navigation
 * with wrap, and Home/End jumps. Logic/styles come from the headless
 * `@refraction-ui/segmented-control` core; styling via Tailwind utilities only.
 */
export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      size = 'md',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isControlled = valueProp !== undefined
    const [internalValue, setInternalValue] = React.useState<
      string | undefined
    >(defaultValue)
    const value = isControlled ? valueProp : internalValue

    // Ordered registry of items, used for arrow-key navigation.
    const itemsRef = React.useRef<ItemRegistration[]>([])

    const select = React.useCallback(
      (next: string) => {
        if (!isControlled) setInternalValue(next)
        onValueChange?.(next)
      },
      [isControlled, onValueChange],
    )

    const register = React.useCallback((itemValue: string, focus: () => void) => {
      const entry: ItemRegistration = { value: itemValue, focus }
      itemsRef.current.push(entry)
      return () => {
        itemsRef.current = itemsRef.current.filter((e) => e !== entry)
      }
    }, [])

    const move = React.useCallback(
      (from: string, key: string) => {
        const items = itemsRef.current
        const currentIndex = items.findIndex((e) => e.value === from)
        if (currentIndex === -1) return

        const targetIndex = getNextSegmentIndex(currentIndex, key, items.length)
        if (targetIndex === currentIndex) return

        const target = items[targetIndex]
        select(target.value)
        target.focus()
      },
      [select],
    )

    const ctx = React.useMemo<SegmentedControlContextValue>(
      () => ({ value, size, select, register, move }),
      [value, size, select, register, move],
    )

    const api = createSegmentedControl({ value, size })

    return (
      <SegmentedControlContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn(segmentedControlVariants({ size }), className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          {children}
        </div>
      </SegmentedControlContext.Provider>
    )
  },
)

SegmentedControl.displayName = 'SegmentedControl'

export interface SegmentedControlItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Value identifying this item; selected when it matches the group value. */
  value: string
}

/**
 * SegmentedControlItem — a single selectable segment (`role="radio"`).
 *
 * Children may include a leading icon. Only the active item is tabbable
 * (roving tabindex); arrow/Home/End keys delegate navigation to the group,
 * which applies the shared `getNextSegmentIndex` rule from the core.
 */
export const SegmentedControlItem = React.forwardRef<
  HTMLButtonElement,
  SegmentedControlItemProps
>(({ value, className, children, onKeyDown, onClick, ...props }, ref) => {
  const ctx = useSegmentedControlContext('SegmentedControlItem')
  const selected = ctx.value === value

  const internalRef = React.useRef<HTMLButtonElement>(null)
  const mergedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      internalRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  React.useEffect(() => {
    return ctx.register(value, () => internalRef.current?.focus())
  }, [ctx, value])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        event.preventDefault()
        ctx.move(value, event.key)
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        ctx.select(value)
        break
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    ctx.select(value)
  }

  return (
    <button
      ref={mergedRef}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      data-state={selected ? 'checked' : 'unchecked'}
      className={cn(
        segmentedControlItemVariants({
          size: ctx.size,
          state: selected ? 'checked' : 'unchecked',
        }),
        className,
      )}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})

SegmentedControlItem.displayName = 'SegmentedControlItem'
