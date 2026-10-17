import * as React from 'react'
import {
  createThreadSummary,
  getThreadSummaryVisibleAvatars,
  threadSummaryClass,
  threadSummaryAvatarsClass,
  threadSummaryAvatarClass,
  threadSummaryLabelClass,
  threadSummaryDetailClass,
  type ThreadSummaryAvatar,
} from '@refraction-ui/thread-summary'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  getInitials,
  type AvatarSize,
} from '@refraction-ui/react-avatar'
import { cn } from '@refraction-ui/shared'

export type { ThreadSummaryAvatar }

/** Size of each replier avatar; the same scale as `Avatar`'s `size`. */
export type ThreadSummaryAvatarSize = AvatarSize

/** Compact by default so the line sits snugly under a message. */
const DEFAULT_AVATAR_SIZE: ThreadSummaryAvatarSize = 'xs'

export interface ThreadSummaryProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  /** Repliers, shown as a stacked, decorative avatar row (first `maxAvatars`). */
  avatars?: ThreadSummaryAvatar[]
  /** Visible summary, e.g. "12 replies". */
  label: string
  /** Secondary text, e.g. "Last reply 2 h ago". */
  detail?: string
  /** Opens the thread. Called on click and on Enter/Space (native button). */
  onTap?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Accessible name override. Defaults to `label` + `detail`. */
  semanticLabel?: string
  /** Size of each replier avatar. */
  avatarSize?: ThreadSummaryAvatarSize
  /** Most avatars to show before the stack is capped. */
  maxAvatars?: number
}

/**
 * ThreadSummary — the replies line under a message ("12 replies · Last reply
 * 2 h ago") that opens the thread.
 *
 * The whole line is a single native `<button>`: the replier avatars are
 * decorative (`aria-hidden`) and the accessible name comes from
 * `semanticLabel`, or `label` + `detail`. The row `flex-wrap`s so the detail
 * moves onto a second line on narrow rows instead of overflowing. Avatars are
 * rendered with `Avatar` from `@refraction-ui/react-avatar`.
 */
export const ThreadSummary = React.forwardRef<HTMLButtonElement, ThreadSummaryProps>(
  function ThreadSummary(
    {
      avatars,
      label,
      detail,
      onTap,
      semanticLabel,
      avatarSize = DEFAULT_AVATAR_SIZE,
      maxAvatars,
      onClick,
      className,
      ...props
    },
    ref,
  ) {
    const visible = getThreadSummaryVisibleAvatars(avatars, maxAvatars)
    const api = createThreadSummary({
      label,
      detail,
      semanticLabel,
      avatarCount: avatars?.length ?? 0,
    })

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      // A consumer `onClick` can veto opening the thread.
      if (!event.defaultPrevented) onTap?.(event)
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(threadSummaryClass, className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
        onClick={handleClick}
      >
        {visible.length > 0 && (
          <span className={threadSummaryAvatarsClass} aria-hidden="true" data-slot="thread-summary-avatars">
            {visible.map((person) => (
              <Avatar key={person.id} size={avatarSize} className={threadSummaryAvatarClass}>
                {person.src && <AvatarImage src={person.src} alt="" />}
                <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
              </Avatar>
            ))}
          </span>
        )}
        <span className={threadSummaryLabelClass} data-slot="thread-summary-label">
          {label}
        </span>
        {detail && (
          <span className={threadSummaryDetailClass} data-slot="thread-summary-detail">
            {detail}
          </span>
        )}
      </button>
    )
  },
)
