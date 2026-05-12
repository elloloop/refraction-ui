import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_VOICE_PILL_POSITION,
  clampVoicePillIntensity,
  createVoicePill,
  getVoicePillAriaLabel,
  getVoicePillInitials,
  getVoicePillPosition,
  getVoicePillPulseStyle,
  getVoicePillSpeakerKey,
  getVoicePillSpeakerLabel,
} from '../src/voice-pill.js'
import {
  voicePillPositionVariants,
  voicePillPulseRingStyles,
  voicePillRootStyles,
} from '../src/voice-pill.styles.js'

describe('voice pill helpers', () => {
  it('clamps intensity to the 0..1 range', () => {
    expect(clampVoicePillIntensity(-1)).toBe(0)
    expect(clampVoicePillIntensity(0.45)).toBe(0.45)
    expect(clampVoicePillIntensity(2)).toBe(1)
    expect(clampVoicePillIntensity(Number.NaN)).toBe(0)
  })

  it('normalizes speaker labels, keys, and initials', () => {
    expect(getVoicePillSpeakerKey('AI')).toBe('ai')
    expect(getVoicePillSpeakerLabel('ai')).toBe('AI')
    expect(getVoicePillInitials('ai')).toBe('AI')
    expect(getVoicePillSpeakerLabel('guest host')).toBe('guest host')
    expect(getVoicePillSpeakerKey('guest host')).toBe('guest-host')
    expect(getVoicePillInitials('guest host')).toBe('GH')
  })

  it('uses the default position when none is provided', () => {
    expect(getVoicePillPosition()).toBe(DEFAULT_VOICE_PILL_POSITION)
  })

  it('builds a status aria label', () => {
    expect(
      getVoicePillAriaLabel({
        speaker: 'user',
        label: 'Taylor',
        sub: 'Speaking',
        muted: true,
      }),
    ).toBe('User: Taylor, Speaking, muted')
  })

  it('computes pulse style variables from intensity and muted state', () => {
    const active = getVoicePillPulseStyle(0.5)
    expect(active['--rfr-voice-pill-intensity']).toBe('0.5')
    expect(active['--rfr-voice-pill-visual-intensity']).toBe('0.5')
    expect(active['--rfr-voice-pill-ring-scale']).toBe('1.175')

    const muted = getVoicePillPulseStyle(0.5, true)
    expect(muted['--rfr-voice-pill-visual-intensity']).toBe('0')
    expect(muted['--rfr-voice-pill-ring-opacity']).toBe('0')
  })
})

describe('createVoicePill', () => {
  it('returns accessibility, data attributes, and normalized values', () => {
    const api = createVoicePill({
      speaker: 'ai',
      label: 'Alex',
      sub: 'Listening',
      intensity: 0.75,
      position: 'top-end',
    })

    expect(api.speaker).toBe('AI')
    expect(api.initials).toBe('AI')
    expect(api.intensity).toBe(0.75)
    expect(api.visualIntensity).toBe(0.75)
    expect(api.position).toBe('top-end')
    expect(api.ariaProps.role).toBe('status')
    expect(api.ariaProps['aria-live']).toBe('polite')
    expect(api.dataAttributes['data-speaker']).toBe('ai')
    expect(api.dataAttributes['data-active']).toBe('true')
  })

  it('invokes the optional mute callback', () => {
    const onToggleMute = vi.fn()
    const api = createVoicePill({ label: 'Alex', onToggleMute })

    api.toggleMute()

    expect(onToggleMute).toHaveBeenCalledTimes(1)
  })
})

describe('voice pill styles', () => {
  it('exposes fixed position and pulse classes', () => {
    expect(voicePillRootStyles).toContain('rounded-full')
    expect(voicePillPulseRingStyles).toContain('motion-reduce:animate-none')
    expect(voicePillPositionVariants({ position: 'bottom-center' })).toContain('fixed')
  })
})
