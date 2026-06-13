/** A single selectable media device (camera, microphone, or speaker). */
export interface MediaDeviceOption {
  id: string
  label: string
}

/** The kind of media device. */
export type DeviceKind = 'camera' | 'microphone' | 'speaker'

export interface PreCallLobbyProps {
  /** Whether the camera is currently enabled. */
  cameraOn: boolean
  /** Whether the microphone is currently enabled. */
  micOn: boolean
}

export interface PreCallLobbyAPI {
  /** ARIA attributes to spread on the group element. */
  ariaProps: { role: 'group'; 'aria-label': string }
  /** Data attributes for styling hooks. */
  dataAttributes: { 'data-camera': string; 'data-mic': string }
}

/**
 * Build the framework-agnostic group props for a pre-call lobby / device-check panel.
 *
 * Returns `role="group"` plus data attributes reflecting camera and mic state.
 * Adapters spread these onto their container and render the device pickers,
 * preview, and join button themselves.
 */
export function createPreCallLobby(props: PreCallLobbyProps): PreCallLobbyAPI {
  const { cameraOn, micOn } = props

  return {
    ariaProps: {
      role: 'group',
      'aria-label': 'Device setup',
    },
    dataAttributes: {
      'data-camera': cameraOn ? 'on' : 'off',
      'data-mic': micOn ? 'on' : 'off',
    },
  }
}

/**
 * Convert a microphone level (0..1) to a count of lit bars.
 *
 * Pure function — no side effects, no JSX. Adapters use this to render
 * the mic level meter by iterating `0..barCount` and lighting bars up to
 * the returned value.
 *
 * @param level    Current mic level in the range [0, 1].
 * @param barCount Total number of bars in the meter.
 * @returns        Number of bars that should appear "lit" (0..barCount).
 */
export function micLevelToBars(level: number, barCount: number): number {
  if (barCount <= 0) return 0
  const clamped = Math.min(1, Math.max(0, level))
  return Math.round(clamped * barCount)
}
