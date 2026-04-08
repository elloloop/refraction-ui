import * as React from 'react'
import {
  createAvatarGroup,
  avatarGroupStyles,
  avatarVariants,
  avatarOverflowBadgeVariants,
  avatarImageStyles,
  avatarPresenceDotVariants,
  type AvatarUser,
  type AvatarSize,
} from '@refraction-ui/avatar-group'
import { cn } from '@refraction-ui/shared'

export interface AvatarGroupProps {
  users: AvatarUser[]
  max?: number
  size?: AvatarSize
  className?: string
}

export function AvatarGroup({ users, max, size = 'md', className }: AvatarGroupProps) {
  const api = createAvatarGroup({ users, max, size })

  return React.createElement(
    'div',
    { ...api.ariaProps, className: cn(avatarGroupStyles, className) },
    api.visibleUsers.map((user) =>
      React.createElement(
        'div',
        {
          key: user.id,
          className: avatarVariants({ size }),
          ...api.getAvatarAriaProps(user),
        },
        user.src
          ? React.createElement('img', {
              src: user.src,
              alt: user.name,
              className: avatarImageStyles,
            })
          : React.createElement('span', null, api.getInitials(user.name)),
        user.status &&
          React.createElement('span', {
            className: avatarPresenceDotVariants({ size, status: user.status }),
          }),
      ),
    ),
    api.overflowCount > 0 &&
      React.createElement(
        'div',
        {
          className: avatarOverflowBadgeVariants({ size }),
          ...api.overflowBadgeProps,
        },
        `+${api.overflowCount}`,
      ),
  )
}

AvatarGroup.displayName = 'AvatarGroup'
