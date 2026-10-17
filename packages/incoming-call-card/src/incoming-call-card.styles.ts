import { cva } from '@refraction-ui/shared'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/**
 * The card container (the `alertdialog`). It receives programmatic focus on
 * mount, so it carries the same visible focus ring as the buttons.
 *
 * - `overlay` floats over the app: full width minus a gutter on phones,
 *   pinned to the top-right corner from `sm` up.
 * - `window` fills its whole (small, separate) window.
 */
export const incomingCallCardVariants = cva({
  base: [
    'flex flex-col items-center gap-4 bg-card text-card-foreground text-center',
    'focus:outline-none',
    FOCUS_RING,
  ].join(' '),
  variants: {
    layout: {
      overlay: [
        'fixed inset-x-4 top-4 z-50 mx-auto max-w-sm p-6',
        'rounded-xl border border-border shadow-lg',
        'sm:left-auto sm:right-4 sm:mx-0 sm:w-full',
      ].join(' '),
      window: 'h-full min-h-full w-full justify-center p-6',
    },
  },
  defaultVariants: {
    layout: 'overlay',
  },
})

/** Wrapper around the avatar: a static halo that always marks "ringing". */
export const incomingCallCardAvatarRingVariants = cva({
  base: 'relative inline-flex rounded-full',
  variants: {
    ringing: {
      true: 'ring-4 ring-primary/30 ring-offset-2 ring-offset-card',
      false: 'ring-2 ring-border ring-offset-2 ring-offset-card',
    },
  },
  defaultVariants: {
    ringing: 'true',
  },
})

/**
 * The expanding pulse behind the avatar. It is purely decorative and is
 * removed entirely under `prefers-reduced-motion`, leaving the static halo.
 */
export const incomingCallCardRingPulseClass =
  'pointer-events-none absolute inset-0 rounded-full bg-primary/40 animate-ping motion-reduce:animate-none motion-reduce:hidden'

/** Caller's name (the dialog's accessible name). */
export const incomingCallCardTitleVariants = cva({
  base: 'font-semibold text-foreground break-words',
  variants: {
    layout: {
      overlay: 'text-lg',
      window: 'text-2xl',
    },
  },
  defaultVariants: {
    layout: 'overlay',
  },
})

/** Kind + context block (the dialog's accessible description). */
export const incomingCallCardDescriptionClass =
  'flex flex-col items-center gap-1 text-sm text-muted-foreground'

/** "Incoming video call" line with its icon. */
export const incomingCallCardKindClass = 'inline-flex items-center gap-1.5 font-medium'

/** Optional context line, e.g. the meeting or team name. */
export const incomingCallCardContextClass = 'text-sm text-muted-foreground'

/** Countdown block (text + decorative progress track). */
export const incomingCallCardCountdownClass = 'flex w-full flex-col items-center gap-1.5'

/** Countdown text. */
export const incomingCallCardCountdownTextClass = 'text-xs tabular-nums text-muted-foreground'

/** Countdown progress track. */
export const incomingCallCardCountdownTrackClass =
  'h-1 w-full overflow-hidden rounded-full bg-muted'

/** Countdown progress bar; its width is set inline from the countdown fraction. */
export const incomingCallCardCountdownBarClass =
  'h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear motion-reduce:transition-none'

/** Row holding Decline and Accept. */
export const incomingCallCardActionsClass = 'flex w-full gap-3'

/**
 * Accept / Decline buttons. Colour is a secondary cue only: each button also
 * has its own icon and visible text, and both are at least 44 px tall.
 */
export const incomingCallCardActionVariants = cva({
  base: [
    'inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2 rounded-full px-4',
    'text-sm font-medium transition-colors',
    FOCUS_RING,
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  variants: {
    action: {
      accept: 'bg-success text-success-foreground hover:bg-success/90',
      decline: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
  },
  defaultVariants: {
    action: 'accept',
  },
})

/** Icon inside an action button or the kind line. */
export const incomingCallCardIconClass = 'size-4 shrink-0'
