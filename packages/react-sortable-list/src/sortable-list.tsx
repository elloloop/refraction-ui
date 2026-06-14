import * as React from 'react'
import {
  reorder,
  getNextOrderIndex,
  createSortableList,
  sortableListVariants,
  sortableListRowVariants,
  sortableListGripClass,
  sortableListContentClass,
} from '@refraction-ui/sortable-list'
import { cn } from '@refraction-ui/shared'

/** Props injected into each rendered row via renderItem. */
export interface DragHandleProps {
  /** Must be spread onto the grip element (button). */
  'aria-label': string
  /** Role is already set inside the component; exposed for convenience. */
  role: 'button'
  tabIndex: number
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void
}

export interface SortableListProps<T>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onSelect' | 'results' | 'color' | 'content' | 'children'
  > {
  /** The ordered list of items to render. */
  items: T[]
  /** Return a stable key for each item. */
  getKey: (item: T, index: number) => string | number
  /**
   * Render the content of a single row.
   * Spread `dragHandleProps` onto your grip button so keyboard + DnD work.
   */
  renderItem: (
    item: T,
    meta: { index: number; dragHandleProps: DragHandleProps },
  ) => React.ReactNode
  /** Called when the user reorders an item. Receives the new items array. */
  onReorder?: (items: T[]) => void
  /** Disables all drag and keyboard reordering. */
  disabled?: boolean
}

/**
 * SortableList — a generic, accessible drag-to-reorder vertical list.
 *
 * Uses native HTML5 DnD for mouse/pointer reordering and keyboard
 * (ArrowUp/Down, Home/End on the grip button) for keyboard reordering.
 * All interaction state is managed internally; the caller receives the
 * new items array via `onReorder`.
 *
 * SSR-safe: no `window` access at render time; DnD event handlers are
 * attached only in the browser.
 */
function SortableListInner<T>(
  {
    items,
    getKey,
    renderItem,
    onReorder,
    disabled = false,
    className,
    ...props
  }: SortableListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const dragFromRef = React.useRef<number | null>(null)
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)

  const { ariaProps, dataAttributes } = createSortableList()

  const handleDragStart = (index: number) => (event: React.DragEvent<HTMLButtonElement>) => {
    if (disabled) { event.preventDefault(); return }
    dragFromRef.current = index
    setDraggingIndex(index)
    // Required by some browsers to initiate drag
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (toIndex: number) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (disabled || dragFromRef.current === null || dragFromRef.current === toIndex) return
    const next = reorder(items, dragFromRef.current, toIndex)
    dragFromRef.current = toIndex
    setDraggingIndex(toIndex)
    onReorder?.(next)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDragEnd = () => {
    dragFromRef.current = null
    setDraggingIndex(null)
  }

  const handleGripKeyDown =
    (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return
      const next = getNextOrderIndex(index, event.key, items.length)
      if (next !== index) {
        event.preventDefault()
        onReorder?.(reorder(items, index, next))
      }
    }

  return (
    <div
      ref={ref}
      className={cn(sortableListVariants({ disabled: disabled ? 'true' : 'false' }), className)}
      {...ariaProps}
      {...dataAttributes}
      {...props}
    >
      {items.map((item, index) => {
        const key = getKey(item, index)
        const isDragging = draggingIndex === index

        const dragHandleProps: DragHandleProps = {
          'aria-label': 'Reorder item',
          role: 'button',
          tabIndex: 0,
          onKeyDown: handleGripKeyDown(index),
          onDragStart: handleDragStart(index),
        }

        return (
          <div
            key={key}
            role="listitem"
            draggable={!disabled}
            className={sortableListRowVariants({ dragging: isDragging ? 'true' : 'false' })}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter(index)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          >
            <button
              type="button"
              aria-label={dragHandleProps['aria-label']}
              role={dragHandleProps.role}
              tabIndex={dragHandleProps.tabIndex}
              onKeyDown={dragHandleProps.onKeyDown}
              onDragStart={dragHandleProps.onDragStart}
              className={sortableListGripClass}
              draggable={!disabled}
              disabled={disabled}
            >
              {/* Grip icon — three horizontal lines */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d={`M2 4h12M2 8h12M2 12h12`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className={sortableListContentClass}>
              {renderItem(item, { index, dragHandleProps })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const SortableList = React.forwardRef(SortableListInner) as <T>(
  props: SortableListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement | null

;(SortableList as { displayName?: string }).displayName = 'SortableList'
