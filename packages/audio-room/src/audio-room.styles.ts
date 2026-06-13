import { cva } from '@refraction-ui/shared'

/**
 * Grid container that lays out the speaking orbs.
 *
 * Column count and gap are applied via inline `gridTemplateColumns` in
 * adapters (dynamic count); this cva handles only the non-dynamic layout
 * concerns — display, alignment, and padding.
 */
export const audioRoomVariants = cva({
  base: 'grid place-items-center gap-6 p-6 w-full',
  variants: {},
  defaultVariants: {},
})

/**
 * Wrapper cell for a single orb + name label combination.
 * Keeps the avatar and label centred as a column.
 */
export const audioRoomOrbCellVariants = cva({
  base: 'flex flex-col items-center gap-2',
  variants: {},
  defaultVariants: {},
})

/**
 * The circular avatar / speaking indicator.
 *
 * - `speaking` adds an animated ring using the primary colour.
 * - `muted` dims the orb slightly to signal a silenced microphone.
 */
export const speakingOrbVariants = cva({
  base: [
    'relative inline-flex items-center justify-center',
    'size-20 rounded-full',
    'bg-muted text-muted-foreground font-semibold text-xl select-none',
    'overflow-hidden',
    'transition-shadow duration-300',
  ].join(' '),
  variants: {
    speaking: {
      true: [
        'ring-4 ring-primary ring-offset-2 ring-offset-background',
        'shadow-[0_0_0_4px_hsl(var(--primary)/0.25),0_0_16px_4px_hsl(var(--primary)/0.35)]',
      ].join(' '),
      false: 'ring-2 ring-border',
    },
    muted: {
      true: 'opacity-60',
      false: '',
    },
  },
  defaultVariants: {
    speaking: 'false',
    muted: 'false',
  },
})

/** Name label rendered below each orb. */
export const audioRoomNameLabelClass =
  'text-sm font-medium text-foreground text-center max-w-[6rem] truncate'

/**
 * Muted badge — a small indicator overlaid at the bottom-right of the orb
 * to show the microphone is off.
 */
export const audioRoomMutedBadgeClass = [
  'absolute bottom-0 right-0',
  'inline-flex items-center justify-center',
  'size-6 rounded-full',
  'bg-destructive text-destructive-foreground',
  'text-[10px] leading-none',
  'border-2 border-background',
  'translate-x-1 translate-y-1',
].join(' ')

/**
 * Hand-raise badge — shown at the top-right of the orb.
 */
export const audioRoomHandBadgeClass = [
  'absolute top-0 right-0',
  'inline-flex items-center justify-center',
  'size-6 rounded-full',
  'bg-warning text-warning-foreground',
  'text-[12px] leading-none',
  'border-2 border-background',
  'translate-x-1 -translate-y-1',
].join(' ')
