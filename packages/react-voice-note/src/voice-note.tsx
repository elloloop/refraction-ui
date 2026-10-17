import * as React from 'react'
import {
  VOICE_NOTE_WAVEFORM_COLOR,
  VOICE_NOTE_WAVEFORM_HEIGHT_PX,
  deriveVoiceNoteState,
  formatVoiceNotePlaybackRate,
  getNextVoiceNotePlaybackRate,
  getVoiceNoteClockText,
  getVoiceNotePrimaryAction,
  getVoiceNoteProgressPercent,
  getVoiceNoteSeekTarget,
  getVoiceNoteSliderProps,
  getVoiceNoteStatusMessage,
  getVoiceNoteTimeFromPointer,
  normalizeVoiceNotePlaybackRate,
  resolveVoiceNoteDuration,
  resolveVoiceNoteLabels,
  transitionVoiceNoteState,
  voiceNoteBodyClass,
  voiceNoteMetaClass,
  voiceNotePlayedClass,
  voiceNotePlayheadClass,
  voiceNoteSpeedClass,
  voiceNoteSpinnerClass,
  voiceNoteStatusIconClass,
  voiceNoteStatusVariants,
  voiceNoteTrackVariants,
  voiceNoteUnplayedClass,
  voiceNoteVariants,
  voiceNoteWaveformClass,
  type VoiceNoteLabels,
  type VoiceNoteMediaEvent,
  type VoiceNoteState,
} from '@refraction-ui/voice-note'
import { IconButton } from '@refraction-ui/react-icon-button'
import { Button } from '@refraction-ui/react-button'
import { Waveform, type WaveformSampleInput } from '@refraction-ui/react-waveform'
import { cn } from '@refraction-ui/shared'

export type { VoiceNoteLabels, VoiceNoteState }

export interface VoiceNoteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Audio URL. Only metadata is fetched until the user presses play. */
  src: string
  /** Pre-computed waveform peaks (any length; resampled to the bar count). */
  peaks: WaveformSampleInput
  /**
   * Known length in seconds. Shown before metadata loads and used whenever the
   * browser reports no finite duration (common for recorder-produced WebM).
   */
  duration?: number
  /** Controlled playback speed. */
  playbackRate?: number
  /** Initial playback speed when uncontrolled. Defaults to 1. */
  defaultPlaybackRate?: number
  /** Called with the next speed (1 → 1.5 → 2 → 1) when the speed control is pressed. */
  onPlaybackRateChange?: (rate: number) => void
  /** Replaces the scrubber's default `aria-valuetext` ("0:12 of 0:45"). */
  getAriaValueText?: (currentTime: number, duration: number) => string
  /** Overrides for the visible and accessible strings. */
  labels?: Partial<VoiceNoteLabels>
  /** Called whenever the playback state changes (not on mount). */
  onStateChange?: (state: VoiceNoteState) => void
}

/** Only the primary button (or a touch / pen contact) seeks. */
const PRIMARY_POINTER_BUTTON = 0

/** Inline glyphs (24 × 24, `currentColor`) so the player needs no icon library. */
function Glyph({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      {children}
    </svg>
  )
}

const PlayIcon = () => (
  <Glyph>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </Glyph>
)

const PauseIcon = () => (
  <Glyph>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </Glyph>
)

const ErrorIcon = () => (
  <Glyph className={voiceNoteStatusIconClass}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 5h2v7h-2zm0 9h2v2h-2z" />
  </Glyph>
)

function readMediaState(audio: HTMLAudioElement): VoiceNoteState {
  return deriveVoiceNoteState({
    readyState: audio.readyState,
    networkState: audio.networkState,
    paused: audio.paused,
    ended: audio.ended,
    hasError: audio.error != null,
  })
}

/** Playback speed, controlled (`playbackRate`) or uncontrolled. */
function usePlaybackRate(
  playbackRate: number | undefined,
  defaultPlaybackRate: number | undefined,
  onPlaybackRateChange: ((rate: number) => void) | undefined,
) {
  const [internal, setInternal] = React.useState(() =>
    normalizeVoiceNotePlaybackRate(defaultPlaybackRate),
  )
  const isControlled = playbackRate !== undefined
  const rate = normalizeVoiceNotePlaybackRate(isControlled ? playbackRate : internal)

  const cycle = React.useCallback(() => {
    const next = getNextVoiceNotePlaybackRate(rate)
    if (!isControlled) setInternal(next)
    onPlaybackRateChange?.(next)
  }, [isControlled, onPlaybackRateChange, rate])

  return { rate, cycle }
}

/** Reports state changes after mount, through a ref so a new callback never re-fires it. */
function useStateChangeCallback(
  state: VoiceNoteState,
  onStateChange: ((state: VoiceNoteState) => void) | undefined,
) {
  const callbackRef = React.useRef(onStateChange)
  callbackRef.current = onStateChange
  const previousRef = React.useRef(state)

  React.useEffect(() => {
    if (previousRef.current === state) return
    previousRef.current = state
    callbackRef.current?.(state)
  }, [state])
}

/**
 * VoiceNote — a compact player for an audio message.
 *
 * A play / pause IconButton, the existing Waveform as a seek slider
 * (`role="slider"` with "0:12 of 0:45" value text; arrows seek 5 s, Home / End
 * jump to the ends, pointer press / drag seeks), an elapsed / total clock, and
 * a 1× → 1.5× → 2× speed control. Loading and error states are shown in text
 * and announced through a polite status region. The `<audio>` element only
 * preloads metadata. All rules (state machine, formatting, key map, clamping)
 * come from the headless `@refraction-ui/voice-note` core.
 */
export const VoiceNote = React.forwardRef<HTMLDivElement, VoiceNoteProps>(function VoiceNote(
  {
    src,
    peaks,
    duration: durationProp,
    playbackRate,
    defaultPlaybackRate,
    onPlaybackRateChange,
    getAriaValueText,
    labels: labelOverrides,
    onStateChange,
    className,
    ...props
  },
  ref,
) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const trackRef = React.useRef<HTMLDivElement | null>(null)
  const draggingRef = React.useRef(false)

  const [state, setState] = React.useState<VoiceNoteState>('idle')
  const [currentTime, setCurrentTime] = React.useState(0)
  const [mediaDuration, setMediaDuration] = React.useState<number | undefined>(undefined)
  const { rate, cycle } = usePlaybackRate(playbackRate, defaultPlaybackRate, onPlaybackRateChange)
  useStateChangeCallback(state, onStateChange)

  const labels = resolveVoiceNoteLabels(labelOverrides)
  const duration = resolveVoiceNoteDuration(mediaDuration, durationProp)
  const isError = state === 'error'
  const action = getVoiceNotePrimaryAction(state)
  const statusMessage = getVoiceNoteStatusMessage(state, labels)
  const percent = getVoiceNoteProgressPercent(currentTime, duration)

  const syncTimes = React.useCallback((audio: HTMLAudioElement) => {
    setCurrentTime(audio.currentTime)
    setMediaDuration(audio.duration)
  }, [])

  // Events fired before hydration attached React's listeners are lost, so
  // read the element once on mount instead of assuming a fresh start.
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    setState(readMediaState(audio))
    syncTimes(audio)
  }, [syncTimes])

  // The load algorithm resets `playbackRate` to `defaultPlaybackRate`, so set
  // both and re-apply when the source changes.
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.defaultPlaybackRate = rate
    audio.playbackRate = rate
  }, [rate, src])

  const mediaHandler = (event: VoiceNoteMediaEvent) => (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setState((current) => transitionVoiceNoteState(current, event))
    syncTimes(e.currentTarget)
  }

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return
    if (action === 'pause') {
      audio.pause()
      return
    }
    // play() rejects when a pause interrupts it or the browser refuses
    // playback; no media event reports that, so re-read the element, which
    // holds the real state. Older browsers return undefined instead of a promise.
    const pending = audio.play() as Promise<void> | undefined
    pending?.catch(() => setState(readMediaState(audio)))
  }

  const seekTo = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seconds
    // Reflect the seek at once rather than waiting for the next timeupdate.
    setCurrentTime(seconds)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isError) return
    const now = audioRef.current?.currentTime ?? currentTime
    const target = getVoiceNoteSeekTarget(now, event.key, duration)
    if (target === null) return
    event.preventDefault()
    seekTo(target)
  }

  const seekToPointer = (clientX: number) => {
    const track = trackRef.current
    if (!track) return
    seekTo(getVoiceNoteTimeFromPointer(clientX, track.getBoundingClientRect(), duration))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isError || event.button !== PRIMARY_POINTER_BUTTON) return
    draggingRef.current = true
    // jsdom and some older engines lack pointer capture; dragging then only
    // tracks while the pointer stays over the track.
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    seekToPointer(event.clientX)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    seekToPointer(event.clientX)
  }

  const endDrag = () => {
    draggingRef.current = false
  }

  const sliderProps = getVoiceNoteSliderProps({
    currentTime,
    duration,
    label: labels.seek,
    getAriaValueText,
    disabled: isError,
  })

  return (
    <div
      ref={ref}
      role="group"
      aria-label={labels.group}
      data-state={state}
      className={cn(voiceNoteVariants({ error: isError ? 'true' : 'false' }), className)}
      {...props}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadStart={mediaHandler('loadstart')}
        onLoadedMetadata={mediaHandler('loadedmetadata')}
        onPlay={mediaHandler('play')}
        onPlaying={mediaHandler('playing')}
        onPause={mediaHandler('pause')}
        onEnded={mediaHandler('ended')}
        onSeeked={mediaHandler('seeked')}
        onError={mediaHandler('error')}
        onEmptied={mediaHandler('emptied')}
        onTimeUpdate={(e) => syncTimes(e.currentTarget)}
        onDurationChange={(e) => syncTimes(e.currentTarget)}
      />
      {/* Label swap, not aria-pressed: the button names the action it performs next, matching the icon. */}
      <IconButton
        icon={action === 'pause' ? <PauseIcon /> : <PlayIcon />}
        label={action === 'pause' ? labels.pause : labels.play}
        variant="default"
        disabled={isError}
        onClick={togglePlayback}
        data-voice-note-toggle=""
      />
      <div className={voiceNoteBodyClass}>
        <div
          ref={trackRef}
          tabIndex={isError ? -1 : 0}
          className={voiceNoteTrackVariants({ disabled: isError ? 'true' : 'false' })}
          {...sliderProps}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          data-voice-note-track=""
        >
          <div
            aria-hidden="true"
            className={voiceNoteWaveformClass}
            style={{ height: VOICE_NOTE_WAVEFORM_HEIGHT_PX }}
          >
            <Waveform
              samples={peaks}
              paused
              color={VOICE_NOTE_WAVEFORM_COLOR}
              height={VOICE_NOTE_WAVEFORM_HEIGHT_PX}
              className={voiceNoteUnplayedClass}
            />
            <div
              className={voiceNotePlayedClass}
              style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
              data-voice-note-played=""
            >
              <Waveform
                samples={peaks}
                paused
                color={VOICE_NOTE_WAVEFORM_COLOR}
                height={VOICE_NOTE_WAVEFORM_HEIGHT_PX}
              />
            </div>
            <span
              className={voiceNotePlayheadClass}
              style={{ left: `${percent}%` }}
              data-voice-note-playhead=""
            />
          </div>
        </div>
        <div className={voiceNoteMetaClass}>
          {statusMessage === null && (
            <span className="text-muted-foreground" data-voice-note-clock="">
              {getVoiceNoteClockText(currentTime, duration)}
            </span>
          )}
          <span role="status" className={voiceNoteStatusVariants({ tone: isError ? 'error' : 'muted' })}>
            {state === 'loading' && <span aria-hidden="true" className={voiceNoteSpinnerClass} />}
            {isError && <ErrorIcon />}
            {statusMessage}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={voiceNoteSpeedClass}
        disabled={isError}
        onClick={cycle}
        data-voice-note-speed=""
      >
        <span className="sr-only">{`${labels.playbackRate} `}</span>
        {formatVoiceNotePlaybackRate(rate)}
      </Button>
    </div>
  )
})
