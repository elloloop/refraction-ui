import type { AccessibilityProps } from '@refraction-ui/shared'

export type VoicePillSpeaker = 'ai' | 'user' | (string & {})

export type VoicePillPosition =
  | 'inline'
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'left-start'
  | 'left-center'
  | 'left-end'
  | 'right-start'
  | 'right-center'
  | 'right-end'

export interface VoicePillProps {
  /** Speaker identity used for labels and data-speaker theming */
  speaker?: VoicePillSpeaker
  /** Primary voice status text */
  label: string
  /** Optional secondary status text */
  sub?: string
  /** Voice activity intensity, clamped from 0 to 1 */
  intensity?: number
  /** Whether voice output/input is muted */
  muted?: boolean
  /** Callback for the optional mute toggle */
  onToggleMute?: () => void
  /** Viewport position, or inline for embedding inside another layout */
  position?: VoicePillPosition
}

export interface VoicePillStyleVars {
  [key: `--${string}`]: string
}

export interface VoicePillAPI {
  /** Display speaker label */
  speaker: string
  /** Normalized key for data-speaker */
  speakerKey: string
  /** Primary label */
  label: string
  /** Secondary label */
  sub?: string
  /** Clamped raw intensity */
  intensity: number
  /** Intensity used for visual animation after muted state is applied */
  visualIntensity: number
  /** Muted state */
  muted: boolean
  /** Viewport position, or inline for embedding inside another layout */
  position: VoicePillPosition
  /** Fallback initials for the speaker avatar */
  initials: string
  /** Invoke the mute callback when provided */
  toggleMute(): void
  /** ARIA props for the live status pill */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** ARIA props for the mute toggle */
  toggleMuteAriaProps: Record<string, unknown>
  /** Data attributes reflecting speaker/state */
  dataAttributes: Record<string, string>
  /** CSS custom properties that drive pulse visuals */
  style: VoicePillStyleVars
}

export const DEFAULT_VOICE_PILL_SPEAKER = 'ai'
export const DEFAULT_VOICE_PILL_POSITION: VoicePillPosition = 'bottom-center'

function formatNumber(value: number): string {
  return Number(value.toFixed(3)).toString()
}

function getRawSpeaker(speaker?: VoicePillSpeaker): string {
  const value = String(speaker ?? DEFAULT_VOICE_PILL_SPEAKER).trim()
  return value.length > 0 ? value : DEFAULT_VOICE_PILL_SPEAKER
}

export function clampVoicePillIntensity(intensity = 0): number {
  const value = Number(intensity)

  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(1, Math.max(0, value))
}

export function getVoicePillSpeakerKey(speaker?: VoicePillSpeaker): string {
  const normalized = getRawSpeaker(speaker)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized.length > 0 ? normalized : DEFAULT_VOICE_PILL_SPEAKER
}

export function getVoicePillSpeakerLabel(speaker?: VoicePillSpeaker): string {
  const raw = getRawSpeaker(speaker)
  const key = getVoicePillSpeakerKey(raw)

  if (key === 'ai') return 'AI'
  if (key === 'user') return 'User'

  return raw
}

export function getVoicePillInitials(speaker?: VoicePillSpeaker): string {
  const key = getVoicePillSpeakerKey(speaker)

  if (key === 'ai') return 'AI'
  if (key === 'user') return 'U'

  const initials = getVoicePillSpeakerLabel(speaker)
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return initials.length > 0 ? initials : 'V'
}

export function getVoicePillPosition(
  position?: VoicePillPosition,
): VoicePillPosition {
  return position ?? DEFAULT_VOICE_PILL_POSITION
}

export function getVoicePillAriaLabel(props: {
  speaker?: VoicePillSpeaker
  label: string
  sub?: string
  muted?: boolean
}): string {
  const parts = [`${getVoicePillSpeakerLabel(props.speaker)}: ${props.label}`]

  if (props.sub) {
    parts.push(props.sub)
  }

  if (props.muted) {
    parts.push('muted')
  }

  return parts.join(', ')
}

export function getVoicePillPulseStyle(
  intensity?: number,
  muted = false,
): VoicePillStyleVars {
  const clamped = clampVoicePillIntensity(intensity)
  const visualIntensity = muted ? 0 : clamped
  const ringOpacity = visualIntensity === 0 ? 0 : 0.12 + visualIntensity * 0.42
  const ringScale = 1 + visualIntensity * 0.35
  const duration = visualIntensity === 0
    ? 1800
    : Math.round(1700 - visualIntensity * 700)

  return {
    '--rfr-voice-pill-intensity': formatNumber(clamped),
    '--rfr-voice-pill-visual-intensity': formatNumber(visualIntensity),
    '--rfr-voice-pill-ring-opacity': formatNumber(ringOpacity),
    '--rfr-voice-pill-ring-scale': formatNumber(ringScale),
    '--rfr-voice-pill-pulse-duration': `${duration}ms`,
    '--rfr-voice-pill-pulse-delay': `-${Math.round(duration / 2)}ms`,
  }
}

export function createVoicePill(props: VoicePillProps): VoicePillAPI {
  const {
    speaker: speakerProp,
    label,
    sub,
    intensity: intensityProp,
    muted: mutedProp = false,
    onToggleMute,
    position: positionProp,
  } = props

  const speaker = getVoicePillSpeakerLabel(speakerProp)
  const speakerKey = getVoicePillSpeakerKey(speakerProp)
  const intensity = clampVoicePillIntensity(intensityProp)
  const muted = Boolean(mutedProp)
  const visualIntensity = muted ? 0 : intensity
  const position = getVoicePillPosition(positionProp)

  function toggleMute(): void {
    onToggleMute?.()
  }

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': true,
    'aria-label': getVoicePillAriaLabel({ speaker: speakerProp, label, sub, muted }),
  }

  const toggleMuteAriaProps: Record<string, unknown> = {
    'aria-label': muted ? 'Unmute voice' : 'Mute voice',
    'aria-pressed': muted,
  }

  const dataAttributes: Record<string, string> = {
    'data-speaker': speakerKey,
    'data-muted': String(muted),
    'data-position': position,
    'data-intensity': formatNumber(intensity),
    'data-active': String(visualIntensity > 0),
  }

  return {
    speaker,
    speakerKey,
    label,
    sub,
    intensity,
    visualIntensity,
    muted,
    position,
    initials: getVoicePillInitials(speakerProp),
    toggleMute,
    ariaProps,
    toggleMuteAriaProps,
    dataAttributes,
    style: getVoicePillPulseStyle(intensity, muted),
  }
}
