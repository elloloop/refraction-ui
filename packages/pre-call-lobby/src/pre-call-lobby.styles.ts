import { cva } from '@refraction-ui/shared'

/**
 * Outer lobby card — a centered panel that holds all preflight controls.
 */
export const preCallLobbyVariants = cva({
  base: [
    'flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm',
    'w-full max-w-lg mx-auto',
  ].join(' '),
  variants: {},
  defaultVariants: {},
})

/**
 * Camera preview area. The `camera` variant switches between the live preview
 * slot and an avatar / placeholder shown when the camera is off.
 */
export const preCallCameraVariants = cva({
  base: [
    'relative flex items-center justify-center overflow-hidden rounded-xl',
    'aspect-video w-full bg-muted',
  ].join(' '),
  variants: {
    camera: {
      on: '',
      off: 'bg-muted',
    },
  },
  defaultVariants: {
    camera: 'on',
  },
})

/** Placeholder shown inside the camera area when the camera is off. */
export const preCallCameraPlaceholderClass = [
  'flex flex-col items-center justify-center gap-2',
  'text-muted-foreground select-none',
].join(' ')

/** Row that holds the label and the <select> for a device picker. */
export const preCallDeviceRowClass = 'flex flex-col gap-1'

/** Label text above a device picker. */
export const preCallDeviceLabelClass = 'text-xs font-medium text-muted-foreground'

/** The <select> element used for device selection. */
export const preCallDeviceSelectClass = [
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1',
  'text-sm text-foreground shadow-sm',
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

/**
 * Mic level meter container. Renders a row of bars.
 */
export const preCallMicMeterClass = 'flex items-end gap-0.5 h-5'

/**
 * An individual bar in the mic level meter.
 * The `lit` variant distinguishes active (lit) from inactive bars.
 */
export const preCallMicBarVariants = cva({
  base: 'w-1.5 rounded-sm transition-colors',
  variants: {
    lit: {
      true: 'bg-primary',
      false: 'bg-muted-foreground/30',
    },
  },
  defaultVariants: {
    lit: 'false',
  },
})

/** Row holding the camera-toggle and mic-toggle buttons. */
export const preCallControlsRowClass = 'flex items-center gap-3'

/**
 * Toggle button for camera or microphone.
 * The `active` variant styles the enabled vs disabled states.
 */
export const preCallToggleVariants = cva({
  base: [
    'inline-flex items-center justify-center rounded-full p-2.5',
    'transition-colors focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2',
  ].join(' '),
  variants: {
    active: {
      true: 'bg-primary text-primary-foreground hover:bg-primary/90',
      false: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})

/** Primary "Join" button. */
export const preCallJoinButtonClass = [
  'inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5',
  'bg-primary text-primary-foreground text-sm font-semibold',
  'shadow transition-colors hover:bg-primary/90',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
].join(' ')
