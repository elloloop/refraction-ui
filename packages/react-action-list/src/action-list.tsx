import * as React from 'react'
import {
  createActionListItem,
  actionListClass,
  actionListItemVariants,
  actionListItemBodyClass,
  actionListItemTitleClass,
  actionListItemDescriptionClass,
  actionListItemMetaClass,
  actionListItemTrailingClass,
  type ActionListDensity,
} from '@refraction-ui/action-list'
import { cn } from '@refraction-ui/shared'

export type { ActionListDensity }

export interface ActionListProps extends React.HTMLAttributes<HTMLUListElement> {}

/** ActionList — a vertical list whose rows are each one action. Renders a `<ul>`. */
export const ActionList = React.forwardRef<HTMLUListElement, ActionListProps>(function ActionList(
  { className, ...props },
  ref,
) {
  return <ul ref={ref} className={cn(actionListClass, className)} data-slot="action-list" {...props} />
})

export interface ActionListItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'type'> {
  /** Primary line (required). */
  title: React.ReactNode
  /** Optional supporting line under the title. */
  description?: React.ReactNode
  /** Optional tertiary line (owner, tags, ids). */
  meta?: React.ReactNode
  /** Optional trailing column (dates, sizes, counts). */
  trailing?: React.ReactNode
  /** Row padding. Defaults to `default`. */
  density?: ActionListDensity
}

/**
 * ActionListItem — one row: an `<li>` holding a full-width native button with
 * a title, optional supporting lines and a trailing column. The ref and all
 * button props go to the button.
 */
export const ActionListItem = React.forwardRef<HTMLButtonElement, ActionListItemProps>(
  function ActionListItem(
    { title, description, meta, trailing, density = 'default', disabled, className, ...props },
    ref,
  ) {
    const api = createActionListItem({ disabled, density })
    return (
      <li>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          className={cn(actionListItemVariants({ density }), className)}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          <span className={actionListItemBodyClass}>
            <span className={actionListItemTitleClass}>{title}</span>
            {description != null && (
              <span className={actionListItemDescriptionClass}>{description}</span>
            )}
            {meta != null && <span className={actionListItemMetaClass}>{meta}</span>}
          </span>
          {trailing != null && <span className={actionListItemTrailingClass}>{trailing}</span>}
        </button>
      </li>
    )
  },
)
