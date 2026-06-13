import * as React from 'react'
import {
  createPreCallLobby,
  micLevelToBars,
  preCallLobbyVariants,
  preCallCameraVariants,
  preCallCameraPlaceholderClass,
  preCallDeviceRowClass,
  preCallDeviceLabelClass,
  preCallDeviceSelectClass,
  preCallMicMeterClass,
  preCallMicBarVariants,
  preCallControlsRowClass,
  preCallToggleVariants,
  preCallJoinButtonClass,
  type MediaDeviceOption,
} from '@refraction-ui/pre-call-lobby'
import { cn } from '@refraction-ui/shared'

export type { MediaDeviceOption }

const MIC_BAR_COUNT = 8

export interface PreCallLobbyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Whether the camera is on. */
  cameraOn: boolean
  /** Whether the microphone is on. */
  micOn: boolean
  /** Called when the user toggles the camera. */
  onToggleCamera?: () => void
  /** Called when the user toggles the microphone. */
  onToggleMic?: () => void
  /** Current microphone level (0..1). */
  micLevel?: number
  /** Available cameras. */
  cameras?: MediaDeviceOption[]
  /** Available microphones. */
  microphones?: MediaDeviceOption[]
  /** Available speakers. */
  speakers?: MediaDeviceOption[]
  /** Currently selected camera id. */
  selectedCamera?: string
  /** Currently selected microphone id. */
  selectedMicrophone?: string
  /** Currently selected speaker id. */
  selectedSpeaker?: string
  /** Called when the user changes a device. */
  onDeviceChange?: (kind: 'camera' | 'microphone' | 'speaker', deviceId: string) => void
  /** Slot rendered inside the camera preview area when the camera is on. */
  previewSlot?: React.ReactNode
  /** Label for the join button. */
  joinLabel?: string
  /** Called when the user clicks the join button. */
  onJoin?: () => void
}

/**
 * PreCallLobby — device-check panel shown before joining a meeting.
 *
 * Renders a camera preview, mic level meter, device selectors for camera /
 * microphone / speaker, toggle buttons for cam and mic, and a primary join CTA.
 * Logic and styles come from the headless `@refraction-ui/pre-call-lobby` core.
 * All device controls are plain HTML elements — no external component deps.
 */
export const PreCallLobby = React.forwardRef<HTMLDivElement, PreCallLobbyProps>(
  (
    {
      cameraOn,
      micOn,
      onToggleCamera,
      onToggleMic,
      micLevel = 0,
      cameras = [],
      microphones = [],
      speakers = [],
      selectedCamera,
      selectedMicrophone,
      selectedSpeaker,
      onDeviceChange,
      previewSlot,
      joinLabel = 'Join',
      onJoin,
      className,
      ...props
    },
    ref,
  ) => {
    const api = createPreCallLobby({ cameraOn, micOn })
    const litBars = micLevelToBars(micLevel, MIC_BAR_COUNT)

    return (
      <div
        ref={ref}
        className={cn(preCallLobbyVariants(), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {/* Camera preview */}
        <div className={preCallCameraVariants({ camera: cameraOn ? 'on' : 'off' })}>
          {cameraOn && previewSlot ? (
            previewSlot
          ) : (
            <div className={preCallCameraPlaceholderClass} data-testid="camera-off-placeholder">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
              <span className="text-xs">Camera is off</span>
            </div>
          )}
        </div>

        {/* Mic level meter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Mic</span>
          <div className={preCallMicMeterClass} aria-label={`Mic level: ${litBars} of ${MIC_BAR_COUNT}`}>
            {Array.from({ length: MIC_BAR_COUNT }, (_, i) => (
              <div
                key={i}
                data-testid={`mic-bar-${i}`}
                data-lit={i < litBars ? 'true' : 'false'}
                className={`${preCallMicBarVariants({ lit: i < litBars ? 'true' : 'false' })} ${
                  /* Staggered heights for a visual meter effect */
                  i < 2 ? 'h-2' : i < 4 ? 'h-3' : i < 6 ? 'h-4' : 'h-5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Device selectors */}
        {cameras.length > 0 && (
          <div className={preCallDeviceRowClass}>
            <label htmlFor="pcl-camera-select" className={preCallDeviceLabelClass}>
              Camera
            </label>
            <select
              id="pcl-camera-select"
              className={preCallDeviceSelectClass}
              value={selectedCamera}
              onChange={(e) => onDeviceChange?.('camera', e.target.value)}
              data-testid="camera-select"
            >
              {cameras.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {microphones.length > 0 && (
          <div className={preCallDeviceRowClass}>
            <label htmlFor="pcl-mic-select" className={preCallDeviceLabelClass}>
              Microphone
            </label>
            <select
              id="pcl-mic-select"
              className={preCallDeviceSelectClass}
              value={selectedMicrophone}
              onChange={(e) => onDeviceChange?.('microphone', e.target.value)}
              data-testid="microphone-select"
            >
              {microphones.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {speakers.length > 0 && (
          <div className={preCallDeviceRowClass}>
            <label htmlFor="pcl-speaker-select" className={preCallDeviceLabelClass}>
              Speaker
            </label>
            <select
              id="pcl-speaker-select"
              className={preCallDeviceSelectClass}
              value={selectedSpeaker}
              onChange={(e) => onDeviceChange?.('speaker', e.target.value)}
              data-testid="speaker-select"
            >
              {speakers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controls row (camera / mic toggles) */}
        <div className={preCallControlsRowClass}>
          <button
            type="button"
            aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'}
            aria-pressed={cameraOn}
            className={preCallToggleVariants({ active: cameraOn ? 'true' : 'false' })}
            onClick={onToggleCamera}
            data-testid="camera-toggle"
          >
            {/* Camera icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {cameraOn ? (
                <>
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </>
              ) : (
                <>
                  <line x1="2" y1="2" x2="22" y2="22" />
                  <path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L23 7v10" />
                  <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10z" />
                </>
              )}
            </svg>
          </button>

          <button
            type="button"
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
            aria-pressed={micOn}
            className={preCallToggleVariants({ active: micOn ? 'true' : 'false' })}
            onClick={onToggleMic}
            data-testid="mic-toggle"
          >
            {/* Mic icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {micOn ? (
                <>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </>
              ) : (
                <>
                  <line x1="2" y1="2" x2="22" y2="22" />
                  <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                  <path d="M5 10v2a7 7 0 0 0 12 5" />
                  <path d="M15 9.34V4a3 3 0 0 0-5.68-1.33" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Join button */}
        <button
          type="button"
          className={preCallJoinButtonClass}
          onClick={onJoin}
          data-testid="join-button"
        >
          {joinLabel}
        </button>
      </div>
    )
  },
)

PreCallLobby.displayName = 'PreCallLobby'
