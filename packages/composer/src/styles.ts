/**
 * cva style variants for the composer surface, pill, tray, and menu.
 * Boolean-ish variants use string 'true'/'false' keys per repo convention
 * (raw booleans fail the dts build).
 */

import { cva } from '@refraction-ui/shared'

/**
 * Outer surface (the rounded card wrapping tray + field + action row).
 * `surface` picks the resting fill: `outlined` (transparent-on-page card) or
 * `filled` (a calm muted fill distinct from the page). Both keep a tasteful
 * focus-visible ring on the pill — a hairline border plus a single-px ring, not
 * a slammed saturated full-perimeter brand border.
 */
export const composerSurfaceVariants = cva({
  base: [
    'overflow-hidden rounded-2xl border shadow-sm',
    'transition-[box-shadow,border-color,background-color] duration-150 ease-out',
    'focus-within:ring-1 focus-within:ring-ring focus-within:shadow-md',
    'motion-reduce:transition-none',
  ].join(' '),
  variants: {
    surface: {
      outlined: 'border-border bg-background focus-within:border-ring',
      filled: 'border-border/50 bg-muted/50 focus-within:border-ring/70 focus-within:bg-background',
    },
    disabled: {
      true: 'pointer-events-none opacity-60',
      false: '',
    },
    error: {
      true: 'border-destructive/50',
      false: '',
    },
  },
  defaultVariants: {
    surface: 'outlined',
    disabled: 'false',
    error: 'false',
  },
})

/** The text field itself (borderless inside the surface). */
export const composerFieldClass =
  'block w-full resize-none bg-transparent px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none'

/** Attachment tray above the field, inside the dock. */
export const composerTrayClass = 'flex flex-wrap gap-2 px-3 pt-3'

/**
 * A single attachment chip. Chips animate in on add (scale + fade) and, when
 * the adapter marks one `exiting`, animate out faster before unmounting. Both
 * degrade to opacity-only / instant under reduced motion.
 */
export const composerAttachmentChipVariants = cva({
  base: [
    'inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs',
    'origin-left transition-all duration-150 ease-out motion-reduce:transition-none',
  ].join(' '),
  variants: {
    status: {
      pending: 'opacity-70',
      uploading: 'opacity-70',
      ready: '',
      error: 'text-destructive',
    },
    exiting: {
      true: 'scale-90 opacity-0 motion-reduce:scale-100',
      false: 'motion-safe:animate-fade-in-scale',
    },
  },
  defaultVariants: {
    status: 'pending',
    exiting: 'false',
  },
})

/** A committed inline token pill rendered by adapters over the flat string. */
export const composerTokenPillClass =
  'rounded bg-accent/40 px-0.5 text-accent-foreground'

/**
 * The caret-anchored suggestion menu. Enters with an eased fade+scale from its
 * bottom edge (it sits above the field); reduced motion drops the movement.
 */
export const composerMenuClass =
  'z-20 w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-lg origin-bottom motion-safe:animate-fade-in-scale'

/**
 * The inline expression/accessory panel docked below the field. It is part of
 * the composer's own stack (never a floating portal), so the textarea and the
 * message in progress stay fully visible while the panel is open. Opens with an
 * eased fade; reduced motion shows it instantly.
 */
export const composerAccessoryPanelClass =
  'border-t border-border motion-safe:animate-fade-in'

/** The built-in expression-panel toggle button. */
export const composerAccessoryToggleVariants = cva({
  base: 'flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  variants: {
    active: {
      true: 'bg-accent text-foreground',
      false: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})

/** A suggestion row; `active` follows keyboard/pointer last-input-wins. */
export const composerMenuItemVariants = cva({
  base: 'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
  variants: {
    active: {
      true: 'bg-accent',
      false: 'hover:bg-accent/50',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})

/** Character counter; switches to the attention treatment at/over the limit. */
export const composerCounterVariants = cva({
  base: 'text-xs tabular-nums',
  variants: {
    overLimit: {
      true: 'font-medium text-destructive',
      false: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    overLimit: 'false',
  },
})

/**
 * Primary action (send ⇄ stop swap driven by `{hasText, canSend, isBusy}`).
 * The colour/affordance change eases; the adapter keys the button on busy so
 * the swap pops in (scale) rather than snapping. Reduced motion keeps it calm.
 */
export const composerPrimaryActionVariants = cva({
  base: 'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 ease-out active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 motion-safe:animate-scale-in',
  variants: {
    enabled: {
      true: 'bg-primary text-primary-foreground hover:opacity-90',
      false: 'bg-muted text-muted-foreground',
    },
  },
  defaultVariants: {
    enabled: 'false',
  },
})
