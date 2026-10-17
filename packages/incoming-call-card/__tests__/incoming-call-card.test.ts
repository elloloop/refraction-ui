import { describe, it, expect } from 'vitest'
import {
  createIncomingCallCard,
  getIncomingCallCardIds,
  getIncomingCallEscapeAction,
  resolveIncomingCallCountdown,
  tickIncomingCallCountdown,
  formatIncomingCallCountdown,
  defaultIncomingCallCountdownLabel,
  INCOMING_CALL_KIND_LABELS,
  incomingCallCardVariants,
  incomingCallCardAvatarRingVariants,
  incomingCallCardActionVariants,
  incomingCallCardRingPulseClass,
} from '../src/index.js'

const ids = { titleId: 't', descriptionId: 'd' }

describe('createIncomingCallCard', () => {
  it('is an alertdialog labelled by the name and described by the kind', () => {
    const { ariaProps } = createIncomingCallCard(ids)
    expect(ariaProps).toEqual({
      role: 'alertdialog',
      'aria-labelledby': 't',
      'aria-describedby': 'd',
    })
  })

  it('is not aria-modal, so the app stays usable while it rings', () => {
    const { ariaProps } = createIncomingCallCard(ids)
    expect(ariaProps['aria-modal']).toBeUndefined()
  })

  it('defaults to an audio overlay that is ringing', () => {
    expect(createIncomingCallCard(ids).dataAttributes).toEqual({
      'data-kind': 'audio',
      'data-layout': 'overlay',
      'data-ringing': 'true',
    })
  })

  it('reflects kind, layout and ringing in data attributes', () => {
    const { dataAttributes } = createIncomingCallCard({
      ...ids,
      kind: 'video',
      layout: 'window',
      ringing: false,
    })
    expect(dataAttributes['data-kind']).toBe('video')
    expect(dataAttributes['data-layout']).toBe('window')
    expect(dataAttributes['data-ringing']).toBe('false')
  })
})

describe('getIncomingCallCardIds', () => {
  it('derives distinct ids from one base', () => {
    expect(getIncomingCallCardIds(':r1:')).toEqual({
      titleId: ':r1:-title',
      descriptionId: ':r1:-description',
    })
  })
})

describe('getIncomingCallEscapeAction', () => {
  it('does nothing on Escape by default', () => {
    expect(getIncomingCallEscapeAction('Escape')).toBeNull()
    expect(getIncomingCallEscapeAction('Escape', 'none')).toBeNull()
  })

  it('maps Escape to decline or dismiss when opted in', () => {
    expect(getIncomingCallEscapeAction('Escape', 'decline')).toBe('decline')
    expect(getIncomingCallEscapeAction('Escape', 'dismiss')).toBe('dismiss')
  })

  it('never maps Enter, Space or other keys, whatever the behaviour', () => {
    for (const behavior of ['none', 'decline', 'dismiss'] as const) {
      for (const key of ['Enter', ' ', 'Tab', 'a', 'Esc']) {
        expect(getIncomingCallEscapeAction(key, behavior)).toBeNull()
      }
    }
  })
})

describe('resolveIncomingCallCountdown', () => {
  it('returns null when there is no countdown', () => {
    expect(resolveIncomingCallCountdown({})).toBeNull()
    expect(resolveIncomingCallCountdown({ timeoutSeconds: 0 })).toBeNull()
    expect(resolveIncomingCallCountdown({ timeoutSeconds: -5 })).toBeNull()
    expect(resolveIncomingCallCountdown({ timeoutSeconds: Number.NaN })).toBeNull()
  })

  it('starts full when only the total is given', () => {
    expect(resolveIncomingCallCountdown({ timeoutSeconds: 30 })).toEqual({
      remaining: 30,
      total: 30,
      fraction: 1,
      expired: false,
    })
  })

  it('uses the remaining seconds against the total', () => {
    expect(resolveIncomingCallCountdown({ timeoutSeconds: 40, remaining: 10 })).toEqual({
      remaining: 10,
      total: 40,
      fraction: 0.25,
      expired: false,
    })
  })

  it('clamps remaining into 0..total', () => {
    expect(resolveIncomingCallCountdown({ timeoutSeconds: 30, remaining: 99 })?.remaining).toBe(30)
    expect(resolveIncomingCallCountdown({ timeoutSeconds: 30, remaining: 99 })?.fraction).toBe(1)
    const negative = resolveIncomingCallCountdown({ timeoutSeconds: 30, remaining: -3 })
    expect(negative).toEqual({ remaining: 0, total: 30, fraction: 0, expired: true })
  })

  it('rounds fractional seconds up so the last second still shows', () => {
    const r = resolveIncomingCallCountdown({ timeoutSeconds: 10, remaining: 0.4 })
    expect(r?.remaining).toBe(1)
    expect(r?.expired).toBe(false)
    expect(r?.fraction).toBeCloseTo(0.04)
  })

  it('supports a controlled remaining without a total (no fraction)', () => {
    expect(resolveIncomingCallCountdown({ remaining: 12 })).toEqual({
      remaining: 12,
      total: null,
      fraction: null,
      expired: false,
    })
    expect(resolveIncomingCallCountdown({ remaining: 0 })?.expired).toBe(true)
  })

  it('ignores a non-finite remaining and falls back to the total', () => {
    expect(
      resolveIncomingCallCountdown({ timeoutSeconds: 20, remaining: Number.POSITIVE_INFINITY })
        ?.remaining,
    ).toBe(20)
  })

  it('is expired at exactly zero', () => {
    expect(resolveIncomingCallCountdown({ timeoutSeconds: 5, remaining: 0 })?.expired).toBe(true)
  })
})

describe('tickIncomingCallCountdown', () => {
  it('decrements by one second and stops at zero', () => {
    expect(tickIncomingCallCountdown(5)).toBe(4)
    expect(tickIncomingCallCountdown(1)).toBe(0)
    expect(tickIncomingCallCountdown(0)).toBe(0)
    expect(tickIncomingCallCountdown(0.5)).toBe(0)
  })
})

describe('formatIncomingCallCountdown', () => {
  it('formats m:ss', () => {
    expect(formatIncomingCallCountdown(0)).toBe('0:00')
    expect(formatIncomingCallCountdown(5)).toBe('0:05')
    expect(formatIncomingCallCountdown(59)).toBe('0:59')
    expect(formatIncomingCallCountdown(60)).toBe('1:00')
    expect(formatIncomingCallCountdown(75)).toBe('1:15')
    expect(formatIncomingCallCountdown(600)).toBe('10:00')
  })

  it('rounds up and never goes negative or NaN', () => {
    expect(formatIncomingCallCountdown(4.2)).toBe('0:05')
    expect(formatIncomingCallCountdown(-3)).toBe('0:00')
    expect(formatIncomingCallCountdown(Number.NaN)).toBe('0:00')
  })

  it('has a readable default label', () => {
    expect(defaultIncomingCallCountdownLabel(25)).toBe('Ends in 0:25')
  })
})

describe('labels and styles', () => {
  it('has a default label per kind', () => {
    expect(INCOMING_CALL_KIND_LABELS.audio).toBe('Incoming audio call')
    expect(INCOMING_CALL_KIND_LABELS.video).toBe('Incoming video call')
  })

  it('positions the overlay but lets the window fill its viewport', () => {
    expect(incomingCallCardVariants({ layout: 'overlay' })).toContain('fixed')
    const window = incomingCallCardVariants({ layout: 'window' })
    expect(window).toContain('h-full')
    expect(window).not.toContain('fixed')
  })

  it('shows a visible focus ring on the card and buttons', () => {
    expect(incomingCallCardVariants()).toContain('focus-visible:ring-2')
    expect(incomingCallCardActionVariants()).toContain('focus-visible:ring-2')
  })

  it('makes both actions at least 44px and uses tokens', () => {
    const accept = incomingCallCardActionVariants({ action: 'accept' })
    const decline = incomingCallCardActionVariants({ action: 'decline' })
    expect(accept).toContain('min-h-11')
    expect(accept).toContain('bg-success')
    expect(decline).toContain('min-h-11')
    expect(decline).toContain('bg-destructive')
  })

  it('stops the ring pulse under reduced motion', () => {
    expect(incomingCallCardRingPulseClass).toContain('animate-ping')
    expect(incomingCallCardRingPulseClass).toContain('motion-reduce:animate-none')
  })

  it('keeps a static halo whether or not it rings', () => {
    expect(incomingCallCardAvatarRingVariants({ ringing: 'true' })).toContain('ring-primary/30')
    expect(incomingCallCardAvatarRingVariants({ ringing: 'false' })).toContain('ring-border')
  })
})
