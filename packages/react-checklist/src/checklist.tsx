import * as React from 'react'
import {
  createChecklist,
  checklistProgress,
  toggleChecklistItem,
  checklistContainerClass,
  checklistListClass,
  checklistItemVariants,
  checklistBoxVariants,
  checklistLabelWrapClass,
  checklistLabelVariants,
  checklistDescriptionClass,
  checklistProgressClass,
  type ChecklistItemData,
} from '@refraction-ui/checklist'
import { cn } from '@refraction-ui/shared'

export type { ChecklistItemData }

export interface ChecklistProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled list of items. */
  items?: ChecklistItemData[]
  /** Initial items for uncontrolled usage. */
  defaultItems?: ChecklistItemData[]
  /** Called when an item is toggled, with the updated items array. */
  onChange?: (items: ChecklistItemData[]) => void
  /** Called with the id of the item that was toggled. */
  onItemToggle?: (id: string) => void
  /** Show a "{completed}/{total}" progress summary below the list. */
  showProgress?: boolean
}

/**
 * Checklist — an interactive task list with optional progress summary.
 *
 * Supports controlled (`items`) and uncontrolled (`defaultItems`) usage.
 * Each item renders as a `role="checkbox"` button; clicking toggles its
 * checked state. Completed items receive muted + strikethrough styling.
 * Logic and styles come from the headless `@refraction-ui/checklist` core.
 */
export const Checklist = React.forwardRef<HTMLDivElement, ChecklistProps>(
  (
    {
      items: itemsProp,
      defaultItems,
      onChange,
      onItemToggle,
      showProgress = false,
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = itemsProp !== undefined
    const [internal, setInternal] = React.useState<ChecklistItemData[]>(
      defaultItems ?? [],
    )
    const items = isControlled ? itemsProp : internal

    const handleToggle = React.useCallback(
      (id: string) => {
        const next = toggleChecklistItem(items, id)
        if (!isControlled) setInternal(next)
        onChange?.(next)
        onItemToggle?.(id)
      },
      [items, isControlled, onChange, onItemToggle],
    )

    const { ariaProps, dataAttributes } = createChecklist()
    const progress = showProgress ? checklistProgress(items) : null

    return (
      <div
        ref={ref}
        className={cn(checklistContainerClass, className)}
        {...dataAttributes}
        {...props}
      >
        <ul className={checklistListClass} {...ariaProps}>
          {items.map((item) => {
            const checked = Boolean(item.checked)
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  data-state={checked ? 'checked' : 'unchecked'}
                  className={checklistItemVariants({ checked: checked ? 'true' : 'false' })}
                  onClick={() => handleToggle(item.id)}
                >
                  <span
                    aria-hidden="true"
                    className={checklistBoxVariants({ checked: checked ? 'true' : 'false' })}
                  >
                    {checked && (
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className={checklistLabelWrapClass}>
                    <span className={checklistLabelVariants({ checked: checked ? 'true' : 'false' })}>
                      {item.label}
                    </span>
                    {item.description && (
                      <span className={checklistDescriptionClass}>
                        {item.description}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {progress !== null && (
          <p className={checklistProgressClass}>
            {`${progress.completed}/${progress.total} completed`}
          </p>
        )}
      </div>
    )
  },
)

Checklist.displayName = 'Checklist'
