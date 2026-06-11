import * as React from 'react'
import { cn } from '@refraction-ui/shared'
import {
  createEmptyState,
  emptyStateVariants,
  emptyStateIconChipVariants,
  emptyStateTitleClass,
  emptyStateDescriptionClass,
  emptyStateActionsClass,
  type EmptyStateTone,
} from '@refraction-ui/empty-state'

export type { EmptyStateTone }

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional icon rendered inside a tone-tinted rounded chip. */
  icon?: React.ReactNode
  /** Tone that tints the icon chip. Defaults to `neutral`. */
  tone?: EmptyStateTone
  /** Primary heading. */
  title: React.ReactNode
  /** Optional supporting copy (supports rich children). */
  description?: React.ReactNode
  /** Optional action row (e.g. buttons), centered under the description. */
  actions?: React.ReactNode
  /** Wrap the content in a bordered card surface. */
  bordered?: boolean
}

/**
 * EmptyState — a centered column for empty/zero/result states and inline
 * confirmations. The icon chip is tinted via `tone`; pass `bordered` to render
 * it on a card surface.
 *
 * Styling and tone resolution come from the headless @refraction-ui/empty-state
 * core (no inline class literals here).
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      tone = 'neutral',
      title,
      description,
      actions,
      bordered = false,
      className,
      ...props
    },
    ref,
  ) => {
    const api = createEmptyState({ tone })

    return (
      <div
        ref={ref}
        className={cn(
          emptyStateVariants({ bordered: bordered ? 'true' : 'false' }),
          className,
        )}
        {...api.dataAttributes}
        {...props}
      >
        {icon != null && (
          <div aria-hidden="true" className={emptyStateIconChipVariants({ tone })}>
            {icon}
          </div>
        )}
        <h3 className={emptyStateTitleClass}>{title}</h3>
        {description != null && (
          <p className={emptyStateDescriptionClass}>{description}</p>
        )}
        {actions != null && (
          <div className={emptyStateActionsClass}>{actions}</div>
        )}
      </div>
    )
  },
)

EmptyState.displayName = 'EmptyState'

export interface ConfirmationCardProps extends EmptyStateProps {}

/**
 * ConfirmationCard — a thin preset of {@link EmptyState} with `bordered`
 * defaulting to `true`, for inline confirmation states (e.g. "Check your email").
 */
export const ConfirmationCard = React.forwardRef<
  HTMLDivElement,
  ConfirmationCardProps
>(({ bordered = true, ...props }, ref) => (
  <EmptyState ref={ref} bordered={bordered} {...props} />
))

ConfirmationCard.displayName = 'ConfirmationCard'
