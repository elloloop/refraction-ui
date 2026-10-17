import { cva } from '@refraction-ui/shared'

/**
 * `isolate` keeps the presence dots' stacking inside the group: a dot is
 * raised over the next avatar in the stack, never over the rest of the page.
 */
export const avatarGroupStyles =
  'isolate flex items-center -space-x-2'

/**
 * One avatar in the stack. It does not clip its content, so a presence dot
 * can sit over its edge; the image and the initials round themselves.
 */
export const avatarVariants = cva({
  base: 'relative inline-flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-medium ring-2 ring-background',
  variants: {
    size: {
      xs: 'h-6 w-6 text-[0.625rem]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const avatarOverflowBadgeVariants = cva({
  base: 'relative inline-flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-medium ring-2 ring-background',
  variants: {
    size: {
      xs: 'h-6 w-6 text-[0.625rem]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Added to the "+N" badge when it is a button: a pointer, a hover tint and a
 * keyboard focus ring (its background-coloured ring turns the ring colour).
 */
export const avatarOverflowButtonStyles =
  'cursor-pointer p-0 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none'

/** The photo, laid over the initials so they show until it loads. */
export const avatarImageStyles =
  'absolute inset-0 h-full w-full rounded-[inherit] object-cover'

/** The initials, shown while the photo loads and when it fails. */
export const avatarInitialsStyles =
  'flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]'

export const avatarPresenceDotVariants = cva({
  // Over the bottom end corner, above the next avatar in the stack.
  base: 'absolute bottom-0 end-0 z-10 rounded-full border-2 border-background',
  variants: {
    size: {
      xs: 'h-2 w-2',
      sm: 'h-2.5 w-2.5',
      md: 'h-3 w-3',
      lg: 'h-3.5 w-3.5',
      xl: 'h-4 w-4',
    },
    status: {
      online: 'bg-success',
      offline: 'bg-neutral',
      away: 'bg-warning',
      busy: 'bg-destructive',
      dnd: 'bg-destructive',
    },
  },
  defaultVariants: {
    size: 'md',
    status: 'offline',
  },
})
