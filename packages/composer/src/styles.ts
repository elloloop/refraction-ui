/**
 * cva style variants for the composer surface, pill, tray, and menu.
 * Boolean-ish variants use string 'true'/'false' keys per repo convention
 * (raw booleans fail the dts build).
 */

import { cva } from '@refraction-ui/shared'

/** Outer surface (the rounded card wrapping tray + field + action row). */
export const composerSurfaceVariants = cva({
  base: [
    'overflow-hidden rounded-2xl border border-border bg-background shadow-sm',
    'transition-shadow focus-within:border-foreground/25 focus-within:shadow-md',
  ].join(' '),
  variants: {
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
    disabled: 'false',
    error: 'false',
  },
})

/** The text field itself (borderless inside the surface). */
export const composerFieldClass =
  'block w-full resize-none bg-transparent px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none'

/** Attachment tray above the field, inside the dock. */
export const composerTrayClass = 'flex flex-wrap gap-2 px-3 pt-3'

/** A single attachment chip. */
export const composerAttachmentChipVariants = cva({
  base: 'inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs',
  variants: {
    status: {
      pending: 'opacity-70',
      uploading: 'opacity-70',
      ready: '',
      error: 'text-destructive',
    },
  },
  defaultVariants: {
    status: 'pending',
  },
})

/** A committed inline token pill rendered by adapters over the flat string. */
export const composerTokenPillClass =
  'rounded bg-accent/40 px-0.5 text-accent-foreground'

/** The caret-anchored suggestion menu. */
export const composerMenuClass =
  'z-20 w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-lg'

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

/** Primary action (send ⇄ stop swap driven by `{hasText, canSend, isBusy}`). */
export const composerPrimaryActionVariants = cva({
  base: 'flex h-9 w-9 items-center justify-center rounded-full transition',
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
