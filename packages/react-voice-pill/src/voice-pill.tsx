import * as React from 'react'
import {
  createVoicePill,
  voicePillAvatarStyles,
  voicePillAvatarWrapStyles,
  voicePillLabelStyles,
  voicePillMuteButtonStyles,
  voicePillPositionVariants,
  voicePillPulseRingStyles,
  voicePillRootStyles,
  voicePillSpeakerStyles,
  voicePillSubStyles,
  voicePillTextStyles,
  type VoicePillProps as CoreVoicePillProps,
} from '@refraction-ui/voice-pill'
import { cn } from '@refraction-ui/shared'

export interface VoicePillProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    CoreVoicePillProps {
  avatar?: React.ReactNode
}

export const VoicePill = React.forwardRef<HTMLDivElement, VoicePillProps>(
  (
    {
      speaker,
      label,
      sub,
      intensity,
      muted,
      onToggleMute,
      position,
      avatar,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const api = createVoicePill({
      speaker,
      label,
      sub,
      intensity,
      muted,
      onToggleMute,
      position,
    })

    const mergedStyle = {
      ...api.style,
      ...style,
    } as React.CSSProperties

    const pulseStyle = {
      animationDuration: 'var(--rfr-voice-pill-pulse-duration)',
      transform: 'scale(var(--rfr-voice-pill-ring-scale))',
    } as React.CSSProperties

    const delayedPulseStyle = {
      ...pulseStyle,
      animationDelay: 'var(--rfr-voice-pill-pulse-delay)',
    } as React.CSSProperties

    return React.createElement(
      'div',
      {
        ...props,
        ...api.ariaProps,
        ...api.dataAttributes,
        ref,
        className: cn(
          voicePillPositionVariants({ position: api.position }),
          voicePillRootStyles,
          voicePillSpeakerStyles,
          className,
        ),
        style: mergedStyle,
      },
      React.createElement(
        'span',
        {
          className: voicePillAvatarWrapStyles,
          'aria-hidden': true,
        },
        api.visualIntensity > 0 &&
          React.createElement('span', {
            className: voicePillPulseRingStyles,
            style: pulseStyle,
          }),
        api.visualIntensity > 0 &&
          React.createElement('span', {
            className: voicePillPulseRingStyles,
            style: delayedPulseStyle,
          }),
        React.createElement(
          'span',
          { className: voicePillAvatarStyles },
          avatar ?? api.initials,
        ),
      ),
      React.createElement(
        'span',
        { className: voicePillTextStyles },
        React.createElement('span', { className: voicePillLabelStyles }, api.label),
        api.sub &&
          React.createElement('span', { className: voicePillSubStyles }, api.sub),
      ),
      onToggleMute &&
        React.createElement(
          'button',
          {
            type: 'button',
            className: voicePillMuteButtonStyles,
            onClick: api.toggleMute,
            ...api.toggleMuteAriaProps,
          },
          renderMuteIcon(api.muted),
        ),
    )
  },
)

VoicePill.displayName = 'VoicePill'

function renderMuteIcon(muted: boolean): React.ReactElement {
  return React.createElement(
    'svg',
    {
      'aria-hidden': true,
      className: 'h-4 w-4',
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: 2,
      viewBox: '0 0 24 24',
    },
    React.createElement('path', {
      d: 'M4 9v6h4l5 4V5L8 9H4Z',
    }),
    muted
      ? React.createElement(
          React.Fragment,
          null,
          React.createElement('path', { d: 'm19 9-4 4' }),
          React.createElement('path', { d: 'm15 9 4 4' }),
        )
      : React.createElement(
          React.Fragment,
          null,
          React.createElement('path', { d: 'M16 8.5a4 4 0 0 1 0 7' }),
          React.createElement('path', { d: 'M18.5 6a7 7 0 0 1 0 12' }),
        ),
  )
}
