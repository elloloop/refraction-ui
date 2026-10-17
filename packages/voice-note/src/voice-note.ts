/**
 * Headless logic for VoiceNote — a compact audio-message player whose waveform
 * doubles as a keyboard-operable seek slider.
 *
 * Everything here is pure: adapters own the `<audio>` element and feed its
 * events and readings in; nothing reads the clock or the DOM.
 */

/** Playback lifecycle of a voice note. */
export type VoiceNoteState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

/**
 * The `HTMLMediaElement` events the state machine reacts to, named exactly as
 * the DOM events.
 */
export type VoiceNoteMediaEvent =
  | 'loadstart'
  | 'loadedmetadata'
  | 'play'
  | 'playing'
  | 'pause'
  | 'ended'
  | 'seeked'
  | 'error'
  | 'emptied'

/** How far one arrow-key press seeks, in seconds. */
export const VOICE_NOTE_SEEK_STEP_SECONDS = 5

/** The speeds the speed control cycles through, in order. */
export const VOICE_NOTE_PLAYBACK_RATES: readonly number[] = [1, 1.5, 2]

/** Normal speed; also the fallback for a rate that is not in the cycle. */
export const VOICE_NOTE_DEFAULT_PLAYBACK_RATE = 1

/** Height of the waveform scrubber, in CSS pixels (canvas drawing size). */
export const VOICE_NOTE_WAVEFORM_HEIGHT_PX = 32

/**
 * Canvas colour for the waveform. `currentColor` lets the adapter colour the
 * played / unplayed bars with token text classes (`text-primary`,
 * `text-muted-foreground`) instead of a literal colour.
 */
export const VOICE_NOTE_WAVEFORM_COLOR = 'currentColor'

/** `HTMLMediaElement.HAVE_METADATA`: duration and dimensions are known. */
export const VOICE_NOTE_MEDIA_HAVE_METADATA = 1

/** `HTMLMediaElement.NETWORK_LOADING`: the browser is fetching the resource. */
export const VOICE_NOTE_MEDIA_NETWORK_LOADING = 2

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const TWO_DIGITS = 2
const PERCENT = 100

/** User-visible strings; every one can be replaced for localisation. */
export interface VoiceNoteLabels {
  /** Accessible name of the whole player (`role="group"`). */
  group: string
  /** Play button name (the button names the action it performs). */
  play: string
  /** Pause button name. */
  pause: string
  /** Accessible name of the seek slider. */
  seek: string
  /** Prefix for the speed button's accessible name, e.g. "Playback speed". */
  playbackRate: string
  /** Shown and announced while metadata loads. */
  loading: string
  /** Shown and announced when the audio cannot be loaded or played. */
  error: string
}

export const DEFAULT_VOICE_NOTE_LABELS: VoiceNoteLabels = {
  group: 'Voice note',
  play: 'Play',
  pause: 'Pause',
  seek: 'Seek',
  playbackRate: 'Playback speed',
  loading: 'Loading…',
  error: 'This voice note could not be played',
}

/** Merge caller overrides onto the defaults. */
export function resolveVoiceNoteLabels(overrides?: Partial<VoiceNoteLabels>): VoiceNoteLabels {
  return { ...DEFAULT_VOICE_NOTE_LABELS, ...overrides }
}

/**
 * The state machine. Unlisted (state, event) pairs keep the current state.
 *
 * - `loadstart` always restarts at `loading` (a new `src` recovers from error).
 * - `loadedmetadata` finishes loading → `idle` (ready, not yet played).
 * - `pause` only moves `playing` → `paused`; browsers also fire `pause` right
 *   before `ended`, and `ended` then wins.
 * - `seeked` after `ended` → `paused`: the user moved back into the track.
 * - `error` is sticky until a new load (`loadstart`) or `emptied`.
 */
export function transitionVoiceNoteState(
  state: VoiceNoteState,
  event: VoiceNoteMediaEvent,
): VoiceNoteState {
  switch (event) {
    case 'loadstart':
      return 'loading'
    case 'emptied':
      return 'idle'
    case 'error':
      return 'error'
    case 'loadedmetadata':
      return state === 'loading' ? 'idle' : state
    case 'play':
    case 'playing':
      return state === 'error' ? state : 'playing'
    case 'pause':
      return state === 'playing' ? 'paused' : state
    case 'ended':
      return state === 'error' ? state : 'ended'
    case 'seeked':
      return state === 'ended' ? 'paused' : state
    default:
      return state
  }
}

/** The subset of an `HTMLMediaElement` needed to recover its state. */
export interface VoiceNoteMediaSnapshot {
  readyState: number
  networkState: number
  paused: boolean
  ended: boolean
  /** `media.error != null`. */
  hasError: boolean
}

/**
 * Derive the state straight from the element. Used on mount (events fired
 * before hydration attached listeners are otherwise lost) and after a
 * rejected `play()` promise, where the element is the source of truth.
 */
export function deriveVoiceNoteState(media: VoiceNoteMediaSnapshot): VoiceNoteState {
  if (media.hasError) return 'error'
  if (media.ended) return 'ended'
  if (media.readyState < VOICE_NOTE_MEDIA_HAVE_METADATA) {
    return media.networkState === VOICE_NOTE_MEDIA_NETWORK_LOADING ? 'loading' : 'idle'
  }
  return media.paused ? 'idle' : 'playing'
}

/** Whether the primary button should pause (only while playing) or play. */
export function getVoiceNotePrimaryAction(state: VoiceNoteState): 'play' | 'pause' {
  return state === 'playing' ? 'pause' : 'play'
}

function isUsableSeconds(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value > 0
}

/**
 * The duration to display. The element's reading wins when it is finite;
 * otherwise the caller's `fallback` (recorder-produced WebM often reports
 * `Infinity` until fully read), otherwise 0.
 */
export function resolveVoiceNoteDuration(mediaDuration: number | undefined, fallback?: number): number {
  if (isUsableSeconds(mediaDuration)) return mediaDuration
  if (isUsableSeconds(fallback)) return fallback
  return 0
}

/** Clamp a time into `[0, duration]`; non-finite input becomes 0. */
export function clampVoiceNoteTime(seconds: number, duration: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0
  if (!Number.isFinite(duration) || duration <= 0) return 0
  return Math.min(seconds, duration)
}

/** Played fraction in `[0, 1]` (0 while the duration is unknown). */
export function getVoiceNoteProgress(currentTime: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0
  return clampVoiceNoteTime(currentTime, duration) / duration
}

/** Played fraction as a CSS percentage, for the playhead and the played layer. */
export function getVoiceNoteProgressPercent(currentTime: number, duration: number): number {
  return getVoiceNoteProgress(currentTime, duration) * PERCENT
}

function pad(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0')
}

/**
 * Format seconds as `m:ss`, or `h:mm:ss` from one hour. Fractions are floored
 * so the clock never shows a second that has not elapsed; negative or
 * non-finite input reads `0:00`.
 */
export function formatVoiceNoteTime(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const hours = Math.floor(total / SECONDS_PER_HOUR)
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const secs = total % SECONDS_PER_MINUTE

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs)}`
  return `${minutes}:${pad(secs)}`
}

/** Default `aria-valuetext`: "0:12 of 0:45". */
export function getVoiceNoteValueText(currentTime: number, duration: number): string {
  return `${formatVoiceNoteTime(currentTime)} of ${formatVoiceNoteTime(duration)}`
}

/**
 * Visible clock: "0:12 / 0:45". While the duration is unknown the elapsed time
 * is shown unclamped, so a stream without a known length still ticks.
 */
export function getVoiceNoteClockText(currentTime: number, duration: number): string {
  const elapsed = duration > 0 ? clampVoiceNoteTime(currentTime, duration) : currentTime
  return `${formatVoiceNoteTime(elapsed)} / ${formatVoiceNoteTime(duration)}`
}

/**
 * Slider key map. Returns the time to seek to, or `null` for a key the slider
 * does not handle (so the adapter leaves the event alone).
 *
 * - ArrowRight / ArrowUp   → +step (clamped to the end)
 * - ArrowLeft  / ArrowDown → −step (clamped to 0)
 * - Home → 0, End → duration
 */
export function getVoiceNoteSeekTarget(
  currentTime: number,
  key: string,
  duration: number,
  step = VOICE_NOTE_SEEK_STEP_SECONDS,
): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return clampVoiceNoteTime(currentTime + step, duration)
    case 'ArrowLeft':
    case 'ArrowDown':
      return clampVoiceNoteTime(currentTime - step, duration)
    case 'Home':
      return 0
    case 'End':
      return clampVoiceNoteTime(duration, duration)
    default:
      return null
  }
}

/** The horizontal extent of the scrubber (from `getBoundingClientRect()`). */
export interface VoiceNoteTrackRect {
  left: number
  width: number
}

/** Map a pointer's `clientX` on the scrubber to a time, clamped to the track. */
export function getVoiceNoteTimeFromPointer(
  clientX: number,
  rect: VoiceNoteTrackRect,
  duration: number,
): number {
  if (!(rect.width > 0)) return 0
  const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  return clampVoiceNoteTime(fraction * duration, duration)
}

/** Next speed in the cycle, wrapping; a rate outside the cycle restarts it. */
export function getNextVoiceNotePlaybackRate(
  current: number,
  rates: readonly number[] = VOICE_NOTE_PLAYBACK_RATES,
): number {
  if (rates.length === 0) return VOICE_NOTE_DEFAULT_PLAYBACK_RATE
  const index = rates.indexOf(current)
  if (index === -1) return rates[0]
  return rates[(index + 1) % rates.length]
}

/** A rate the media element can use: positive and finite, else normal speed. */
export function normalizeVoiceNotePlaybackRate(rate: number | undefined): number {
  return isUsableSeconds(rate) ? rate : VOICE_NOTE_DEFAULT_PLAYBACK_RATE
}

/** Speed as shown on the control: "1×", "1.5×", "2×". */
export function formatVoiceNotePlaybackRate(rate: number): string {
  return `${normalizeVoiceNotePlaybackRate(rate)}×`
}

export interface VoiceNoteSliderOptions {
  currentTime: number
  duration: number
  label: string
  /** Replaces the default "0:12 of 0:45" text. */
  getAriaValueText?: (currentTime: number, duration: number) => string
  disabled?: boolean
}

/**
 * ARIA for the scrubber (`role="slider"`). Values are whole seconds, matching
 * the floored clock; `aria-valuetext` carries the readable position.
 */
export function getVoiceNoteSliderProps(
  options: VoiceNoteSliderOptions,
): Record<string, string | number | boolean> {
  const { currentTime, label, getAriaValueText = getVoiceNoteValueText, disabled = false } = options
  const duration = Number.isFinite(options.duration) && options.duration > 0 ? options.duration : 0
  const now = clampVoiceNoteTime(currentTime, duration)

  const props: Record<string, string | number | boolean> = {
    role: 'slider',
    'aria-label': label,
    'aria-valuemin': 0,
    'aria-valuemax': Math.floor(duration),
    'aria-valuenow': Math.floor(now),
    'aria-valuetext': getAriaValueText(now, duration),
    'aria-orientation': 'horizontal',
  }
  if (disabled) props['aria-disabled'] = true
  return props
}

/** The status line's message, or `null` when the clock should show. */
export function getVoiceNoteStatusMessage(state: VoiceNoteState, labels: VoiceNoteLabels): string | null {
  if (state === 'loading') return labels.loading
  if (state === 'error') return labels.error
  return null
}
