import { cva } from '@refraction-ui/shared'

/*
 * Styles for the prop-driven call dock. The dock reuses the toolbar and
 * round-button variants from `call-controls.styles.ts` and adds what a dock
 * needs on top: the width container, the groups, the joined mic/camera
 * capsules, badges, the leave pill and the "More controls" panel.
 *
 * Every colour is a theme token, so the dock follows light, dark and system
 * themes. The collapse rule is a container query on the dock's own width
 * (`CALL_CONTROLS_COLLAPSE_WIDTH`, 600 px), so it reacts to a side panel
 * narrowing the call column as well as to a phone screen.
 */

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const unavailable = 'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'

/** Full-width wrapper: the size container the collapse rule measures. */
export const callControlsDockClass = '@container/call-controls relative flex w-full min-w-0 justify-center'

/**
 * Added to the toolbar in dock mode: it never overflows its container, and it
 * anchors the "More controls" panel, which opens above the whole bar.
 */
export const callControlsDockBarClass = 'relative max-w-full flex-wrap'

/** A group of controls, divided from the group before it. */
export const callControlsGroupVariants = cva({
  base: 'flex items-center border-s border-border first:border-s-0 first:ps-0',
  variants: {
    size: {
      sm: 'gap-1.5 ps-1.5',
      md: 'gap-2 ps-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Hides a group that collapses into "More controls" on a narrow dock. */
export const callControlsCollapseClass = '@max-[600px]/call-controls:hidden'

/** Holds "More controls" and its panel; shown only on a narrow dock. */
export const callControlsMoreClass = 'hidden @max-[600px]/call-controls:inline-flex'

/** Added to a round dock button: room for a badge, and a visible unavailable state. */
export const callControlsDockButtonClass = `relative ${unavailable}`

/**
 * A mic or camera toggle joined to the slot beside it (a device menu
 * trigger). The capsule carries the tone, so both halves read as one control.
 */
export const callControlsCapsuleVariants = cva({
  base: 'inline-flex items-stretch rounded-full transition-colors',
  variants: {
    size: {
      sm: 'h-9',
      md: 'h-11',
    },
    tone: {
      default: 'bg-muted text-foreground',
      active: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'default',
  },
})

/** The toggle half of a capsule; it takes its colour from the capsule. */
export const callControlsCapsuleButtonVariants = cva({
  base: [
    'relative inline-flex items-center justify-center rounded-s-full',
    'bg-transparent text-current transition-colors hover:bg-current/10 cursor-pointer',
    focusRing,
    unavailable,
  ].join(' '),
  variants: {
    size: {
      sm: 'w-9',
      md: 'w-11',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Wraps the slot half of a capsule and divides it from the toggle. */
export const callControlsCapsuleSlotClass = 'inline-flex items-stretch border-s border-current/25'

/**
 * Classes for a trigger placed in a capsule slot (for example a device menu's
 * chevron), so it fills the slot, takes the capsule's colour and shows the
 * same focus ring as the dock's own buttons.
 */
export const callControlsMenuTriggerClass = [
  'inline-flex self-stretch items-center justify-center rounded-e-full px-1.5',
  'bg-transparent text-current transition-colors hover:bg-current/10 aria-expanded:bg-current/15 cursor-pointer',
  focusRing,
].join(' ')

/** Count bubble over a control. Hidden from assistive tech; the name carries the count. */
export const callControlsBadgeClass = [
  'pointer-events-none absolute -end-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center',
  'rounded-full bg-primary px-1 text-[0.625rem] font-semibold leading-none text-primary-foreground ring-2 ring-card',
].join(' ')

/** Dot on "More controls" when a collapsed control carries a count. */
export const callControlsMoreDotClass =
  'pointer-events-none absolute end-0.5 top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card'

/** The leave-call pill. */
export const callControlsLeaveVariants = cva({
  base: [
    'inline-flex items-center justify-center rounded-full',
    'bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90 cursor-pointer',
    focusRing,
  ].join(' '),
  variants: {
    size: {
      sm: 'h-9 w-14',
      md: 'h-11 w-16',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** The "More controls" panel, opened above the dock and aligned to its end. */
export const callControlsPanelClass = [
  'absolute bottom-full end-0 z-50 mb-2 flex w-56 max-w-[calc(100vw-2rem)] flex-col gap-0.5',
  'rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg',
].join(' ')

/** One control as a row in the "More controls" panel. */
export const callControlsPanelItemClass = [
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm',
  'text-popover-foreground transition-colors hover:bg-muted cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'aria-pressed:font-medium',
  unavailable,
].join(' ')

/** Icon of a panel row, coloured by the control's tone. */
export const callControlsPanelIconVariants = cva({
  base: 'inline-flex shrink-0',
  variants: {
    tone: {
      default: 'text-muted-foreground',
      active: 'text-primary',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

/** Trailing count or check mark of a panel row. */
export const callControlsPanelMetaClass = 'ms-auto inline-flex items-center gap-2 text-xs text-muted-foreground'
