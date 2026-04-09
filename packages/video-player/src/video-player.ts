import type { AccessibilityProps } from '@elloloop/shared'

export interface VideoPlayerProps {
  src?: string
  poster?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
}

export type VideoState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended'

export interface VideoPlayerAPI {
  /** Current player state */
  state: VideoState
  /** Transition to playing state */
  play: () => void
  /** Transition to paused state */
  pause: () => void
  /** Toggle between playing and paused */
  togglePlay: () => void
  /** Toggle mute state */
  toggleMute: () => boolean
  /** ARIA props for the player region */
  ariaProps: Partial<AccessibilityProps>
  /** ARIA props for control buttons */
  controlAriaProps: {
    playPause: Partial<AccessibilityProps>
    mute: Partial<AccessibilityProps>
  }
  /** Data attributes reflecting current state */
  dataAttributes: Record<string, string>
}

export function createVideoPlayer(props: VideoPlayerProps = {}): VideoPlayerAPI {
  const { muted: initialMuted = false } = props

  let state: VideoState = 'idle'
  let isMuted = initialMuted

  function play() {
    if (state === 'ended') {
      state = 'playing'
    } else if (state !== 'playing') {
      state = 'playing'
    }
  }

  function pause() {
    if (state === 'playing') {
      state = 'paused'
    }
  }

  function togglePlay() {
    if (state === 'playing') {
      pause()
    } else {
      play()
    }
  }

  function toggleMute(): boolean {
    isMuted = !isMuted
    return isMuted
  }

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'region',
    'aria-label': 'Video player',
  }

  const api: VideoPlayerAPI = {
    get state() {
      return state
    },
    play,
    pause,
    togglePlay,
    toggleMute,
    ariaProps,
    get controlAriaProps() {
      return {
        playPause: {
          'aria-label': state === 'playing' ? 'Pause' : 'Play',
        },
        mute: {
          'aria-label': isMuted ? 'Unmute' : 'Mute',
        },
      }
    },
    get dataAttributes() {
      return {
        'data-state': state,
      }
    },
  }

  return api
}
