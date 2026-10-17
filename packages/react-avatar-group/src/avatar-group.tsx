import * as React from 'react'
import {
  createAvatarGroup,
  getAvatarImageStatus,
  avatarGroupStyles,
  avatarVariants,
  avatarOverflowBadgeVariants,
  avatarOverflowButtonStyles,
  avatarImageStyles,
  avatarInitialsStyles,
  avatarPresenceDotVariants,
  type AvatarImageStatus,
  type AvatarUser,
  type AvatarSize,
} from '@refraction-ui/avatar-group'
import { cn } from '@refraction-ui/shared'

export interface AvatarGroupProps {
  users: AvatarUser[]
  max?: number
  size?: AvatarSize
  className?: string
  /**
   * Makes the "+N" badge a button and is called with it when pressed, e.g. to
   * open a list of everyone anchored to it. Without it the badge is a label.
   */
  onOverflowClick?: (trigger: HTMLButtonElement) => void
}

interface GroupAvatarProps {
  user: AvatarUser
  size: AvatarSize
  initials: string
  ariaProps: Record<string, unknown>
}

/**
 * One avatar in the stack: the photo over the initials, which show while it
 * loads and stay when it fails.
 */
function GroupAvatar({ user, size, initials, ariaProps }: GroupAvatarProps) {
  const imageRef = React.useRef<HTMLImageElement>(null)
  // The status belongs to the src it was read for; a new src starts loading.
  const [settled, setSettled] = React.useState<{ src: string; status: AvatarImageStatus }>()
  const status: AvatarImageStatus =
    user.src && settled?.src === user.src ? settled.status : 'loading'

  React.useEffect(() => {
    // A server-rendered image can load or fail before hydration attaches its
    // handlers, so read where it got to instead of waiting for an event.
    const image = imageRef.current
    if (!image || !user.src) return
    const now = getAvatarImageStatus(image)
    if (now !== 'loading') setSettled({ src: user.src, status: now })
  }, [user.src])

  const settle = (next: AvatarImageStatus) => () => {
    if (user.src) setSettled({ src: user.src, status: next })
  }

  const showImage = Boolean(user.src) && status !== 'failed'
  const showInitials = !user.src || status !== 'loaded'

  return (
    <div className={avatarVariants({ size })} {...ariaProps}>
      {showInitials && <span className={avatarInitialsStyles}>{initials}</span>}
      {showImage && (
        // The avatar is the named image; the photo inside it is decoration.
        <img
          ref={imageRef}
          src={user.src}
          alt=""
          className={avatarImageStyles}
          onLoad={settle('loaded')}
          onError={settle('failed')}
        />
      )}
      {user.status && (
        <span className={avatarPresenceDotVariants({ size, status: user.status })} />
      )}
    </div>
  )
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ users, max, size = 'md', className, onOverflowClick }, ref) {
    const idPrefix = `rfr-avatar-group-${React.useId()}`
    const overflowInteractive = Boolean(onOverflowClick)
    const api = createAvatarGroup({ users, max, size, overflowInteractive, idPrefix })
    const badgeClassName = cn(
      avatarOverflowBadgeVariants({ size }),
      overflowInteractive && avatarOverflowButtonStyles,
    )

    return (
      <div ref={ref} {...api.ariaProps} className={cn(avatarGroupStyles, className)}>
        {api.visibleUsers.map((user) => (
          <GroupAvatar
            key={user.id}
            user={user}
            size={size}
            initials={api.getInitials(user.name)}
            ariaProps={api.getAvatarAriaProps(user)}
          />
        ))}
        {api.overflowCount > 0 &&
          (onOverflowClick ? (
            <button
              {...api.overflowBadgeProps}
              type="button"
              className={badgeClassName}
              onClick={(event) => onOverflowClick(event.currentTarget)}
            >
              {`+${api.overflowCount}`}
            </button>
          ) : (
            <div {...api.overflowBadgeProps} className={badgeClassName}>
              {`+${api.overflowCount}`}
            </div>
          ))}
      </div>
    )
  },
)
