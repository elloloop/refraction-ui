import { cva } from '@refraction-ui/shared'
import type { PresenceStatus } from './presence-indicator.js'

/**
 * The fill for each status. Shared by every dot that shows presence (this
 * indicator and the avatar's), so a status reads the same everywhere.
 */
export const presenceDotColorClasses: Record<PresenceStatus, string> = {
  online: 'bg-success',
  offline: 'bg-neutral',
  away: 'bg-warning',
  busy: 'bg-destructive',
  dnd: 'bg-destructive',
}

export const presenceDotVariants = cva({
  base: 'inline-block rounded-full',
  variants: {
    status: presenceDotColorClasses,
    size: {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
    },
  },
  defaultVariants: {
    status: 'offline',
    size: 'md',
  },
})

export const presenceContainerStyles =
  'inline-flex items-center gap-1.5'

export const presenceLabelStyles =
  'text-sm text-muted-foreground'
