import * as React from 'react'
import {
  createVideoPlayer,
  playerVariants,
  controlsVariants,
  overlayVariants,
  type VideoPlayerProps as CoreVideoPlayerProps,
} from '@refraction-ui/video-player'
import { cn } from '@refraction-ui/shared'

export interface VideoPlayerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'src'>,
    CoreVideoPlayerProps {}

export const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      src,
      poster,
      autoplay = false,
      muted: initialMuted = false,
      controls = true,
      className,
      ...props
    },
    ref,
  ) => {
    const [, setTick] = React.useState(0)
    const rerender = React.useCallback(() => setTick((t) => t + 1), [])

    const apiRef = React.useRef(
      createVideoPlayer({ src, poster, autoplay, muted: initialMuted, controls }),
    )
    const api = apiRef.current

    // No src — show placeholder
    if (!src) {
      return (
        <div
          ref={ref}
          className={cn(playerVariants(), 'flex items-center justify-center aspect-video', className)}
          {...api.ariaProps}
          {...props}
        >
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Coming soon</p>
          </div>
        </div>
      )
    }

    const handlePlay = () => {
      api.play()
      rerender()
    }

    const handlePause = () => {
      api.pause()
      rerender()
    }

    const handleTogglePlay = () => {
      api.togglePlay()
      rerender()
    }

    const handleToggleMute = () => {
      api.toggleMute()
      rerender()
    }

    const isPlaying = api.state === 'playing'

    return (
      <div
        ref={ref}
        className={cn(playerVariants(), 'aspect-video', className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        <video
          className="h-full w-full"
          src={src}
          poster={poster}
          autoPlay={autoplay}
          muted={initialMuted}
          onPlay={handlePlay}
          onPause={handlePause}
        />

        {/* Center play/pause overlay */}
        {controls && (
          <div className={overlayVariants({ visibility: isPlaying ? 'hidden' : 'visible' })}>
            <button
              type="button"
              className="rounded-full bg-white/90 p-4 text-black shadow-lg"
              onClick={handleTogglePlay}
              {...api.controlAriaProps.playPause}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        )}

        {/* Bottom controls bar */}
        {controls && (
          <div className={controlsVariants()}>
            <button
              type="button"
              className="rounded bg-white/20 px-3 py-1 text-sm text-white"
              onClick={handleToggleMute}
              {...api.controlAriaProps.mute}
            >
              {api.controlAriaProps.mute['aria-label']}
            </button>
          </div>
        )}
      </div>
    )
  },
)

VideoPlayer.displayName = 'VideoPlayer'
