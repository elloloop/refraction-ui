import * as React from 'react'
import {
  createAudioRoom,
  getInitials,
  orbColumns,
  audioRoomVariants,
  audioRoomOrbCellVariants,
  speakingOrbVariants,
  audioRoomNameLabelClass,
  audioRoomMutedBadgeClass,
  audioRoomHandBadgeClass,
  type AudioParticipant,
} from '@refraction-ui/audio-room'
import { cn } from '@refraction-ui/shared'

export type { AudioParticipant }

// ── SpeakingOrb ──────────────────────────────────────────────────────────────

export interface SpeakingOrbProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** Participant display name; used for initials and aria-label. */
  name: string
  /** Optional avatar image URL. Falls back to initials when absent. */
  avatarUrl?: string
  /** Whether this participant is actively speaking. */
  speaking?: boolean
  /** Whether this participant is muted. */
  muted?: boolean
  /** Whether this participant has raised their hand. */
  handRaised?: boolean
}

/**
 * SpeakingOrb — a circular avatar for one audio-room participant.
 *
 * Renders an avatar image (or initials fallback), an animated speaking ring
 * when `speaking` is true, a mic-muted badge when `muted` is true, and an
 * optional raised-hand badge. Fully accessible with `role="img"` and an
 * `aria-label` set to the participant's name.
 */
export const SpeakingOrb = React.forwardRef<HTMLDivElement, SpeakingOrbProps>(
  (
    {
      name,
      avatarUrl,
      speaking = false,
      muted = false,
      handRaised = false,
      className,
      ...props
    },
    ref,
  ) => {
    const initials = getInitials(name)

    return (
      <div
        ref={ref}
        role="img"
        aria-label={name}
        data-speaking={speaking ? 'true' : 'false'}
        data-muted={muted ? 'true' : 'false'}
        data-hand-raised={handRaised ? 'true' : 'false'}
        className={cn(
          speakingOrbVariants({
            speaking: speaking ? 'true' : 'false',
            muted: muted ? 'true' : 'false',
          }),
          className,
        )}
        {...props}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}

        {muted && (
          <span className={audioRoomMutedBadgeClass} aria-label="Muted">
            🔇
          </span>
        )}

        {handRaised && (
          <span className={audioRoomHandBadgeClass} aria-label="Hand raised">
            ✋
          </span>
        )}
      </div>
    )
  },
)

SpeakingOrb.displayName = 'SpeakingOrb'

// ── AudioRoom ─────────────────────────────────────────────────────────────────

export interface AudioRoomProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** List of participants to render as speaking orbs. */
  participants: AudioParticipant[]
}

/**
 * AudioRoom — a responsive grid of SpeakingOrbs for an audio-only meeting.
 *
 * Column count is derived from `orbColumns(n)` so the layout adapts
 * automatically as participants join or leave. The grid uses inline
 * `gridTemplateColumns` because the column count is dynamic.
 */
export const AudioRoom = React.forwardRef<HTMLDivElement, AudioRoomProps>(
  ({ participants, className, ...props }, ref) => {
    const cols = orbColumns(participants.length)
    const { ariaProps, dataAttributes } = createAudioRoom()

    return (
      <div
        ref={ref}
        className={cn(audioRoomVariants(), className)}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        {...ariaProps}
        {...dataAttributes}
        {...props}
      >
        {participants.map((participant) => (
          <div key={participant.id} className={audioRoomOrbCellVariants()}>
            <SpeakingOrb
              name={participant.name}
              avatarUrl={participant.avatarUrl}
              speaking={participant.speaking}
              muted={participant.muted}
              handRaised={participant.handRaised}
            />
            <span className={audioRoomNameLabelClass}>{participant.name}</span>
          </div>
        ))}
      </div>
    )
  },
)

AudioRoom.displayName = 'AudioRoom'
