import { describe, expect, it } from 'vitest'
import {
  DEFAULT_VOICE_NOTE_LABELS,
  VOICE_NOTE_PLAYBACK_RATES,
  VOICE_NOTE_SEEK_STEP_SECONDS,
  clampVoiceNoteTime,
  deriveVoiceNoteState,
  formatVoiceNotePlaybackRate,
  formatVoiceNoteTime,
  getNextVoiceNotePlaybackRate,
  getVoiceNoteClockText,
  getVoiceNotePrimaryAction,
  getVoiceNoteProgress,
  getVoiceNoteProgressPercent,
  getVoiceNoteSeekTarget,
  getVoiceNoteSliderProps,
  getVoiceNoteStatusMessage,
  getVoiceNoteTimeFromPointer,
  getVoiceNoteValueText,
  normalizeVoiceNotePlaybackRate,
  resolveVoiceNoteDuration,
  resolveVoiceNoteLabels,
  transitionVoiceNoteState,
  voiceNoteTrackVariants,
  voiceNoteVariants,
  type VoiceNoteMediaEvent,
  type VoiceNoteState,
} from '../src/index.js'

describe('formatVoiceNoteTime', () => {
  it('formats under an hour as m:ss', () => {
    expect(formatVoiceNoteTime(0)).toBe('0:00')
    expect(formatVoiceNoteTime(5)).toBe('0:05')
    expect(formatVoiceNoteTime(45)).toBe('0:45')
    expect(formatVoiceNoteTime(60)).toBe('1:00')
    expect(formatVoiceNoteTime(754)).toBe('12:34')
    expect(formatVoiceNoteTime(3599)).toBe('59:59')
  })

  it('formats an hour or more as h:mm:ss', () => {
    expect(formatVoiceNoteTime(3600)).toBe('1:00:00')
    expect(formatVoiceNoteTime(3725)).toBe('1:02:05')
    expect(formatVoiceNoteTime(36000 + 61)).toBe('10:01:01')
  })

  it('floors fractions so an unelapsed second never shows', () => {
    expect(formatVoiceNoteTime(12.999)).toBe('0:12')
  })

  it('reads 0:00 for negative, NaN and infinite input', () => {
    expect(formatVoiceNoteTime(-3)).toBe('0:00')
    expect(formatVoiceNoteTime(Number.NaN)).toBe('0:00')
    expect(formatVoiceNoteTime(Number.POSITIVE_INFINITY)).toBe('0:00')
  })
})

describe('value text and clock', () => {
  it('reads "0:12 of 0:45"', () => {
    expect(getVoiceNoteValueText(12, 45)).toBe('0:12 of 0:45')
  })

  it('shows "elapsed / total" and clamps elapsed to the duration', () => {
    expect(getVoiceNoteClockText(12.4, 45)).toBe('0:12 / 0:45')
    expect(getVoiceNoteClockText(99, 45)).toBe('0:45 / 0:45')
  })

  it('keeps ticking when the duration is unknown', () => {
    expect(getVoiceNoteClockText(7, 0)).toBe('0:07 / 0:00')
  })
})

describe('resolveVoiceNoteDuration', () => {
  it('prefers a finite media duration', () => {
    expect(resolveVoiceNoteDuration(44.5, 30)).toBe(44.5)
  })

  it('falls back when the media reports NaN, Infinity or 0', () => {
    expect(resolveVoiceNoteDuration(Number.NaN, 30)).toBe(30)
    expect(resolveVoiceNoteDuration(Number.POSITIVE_INFINITY, 30)).toBe(30)
    expect(resolveVoiceNoteDuration(0, 30)).toBe(30)
    expect(resolveVoiceNoteDuration(undefined, 30)).toBe(30)
  })

  it('is 0 when nothing usable is known', () => {
    expect(resolveVoiceNoteDuration(Number.NaN)).toBe(0)
    expect(resolveVoiceNoteDuration(undefined, -1)).toBe(0)
  })
})

describe('clamping and progress', () => {
  it('clamps into [0, duration]', () => {
    expect(clampVoiceNoteTime(-1, 45)).toBe(0)
    expect(clampVoiceNoteTime(10, 45)).toBe(10)
    expect(clampVoiceNoteTime(50, 45)).toBe(45)
    expect(clampVoiceNoteTime(Number.NaN, 45)).toBe(0)
    expect(clampVoiceNoteTime(10, 0)).toBe(0)
  })

  it('computes the played fraction and percentage', () => {
    expect(getVoiceNoteProgress(0, 40)).toBe(0)
    expect(getVoiceNoteProgress(10, 40)).toBe(0.25)
    expect(getVoiceNoteProgress(80, 40)).toBe(1)
    expect(getVoiceNoteProgress(10, 0)).toBe(0)
    expect(getVoiceNoteProgress(10, Number.POSITIVE_INFINITY)).toBe(0)
    expect(getVoiceNoteProgressPercent(10, 40)).toBe(25)
  })
})

describe('getVoiceNoteSeekTarget', () => {
  it('uses a named 5 second step', () => {
    expect(VOICE_NOTE_SEEK_STEP_SECONDS).toBe(5)
  })

  it('seeks forward on ArrowRight / ArrowUp and back on ArrowLeft / ArrowDown', () => {
    expect(getVoiceNoteSeekTarget(10, 'ArrowRight', 45)).toBe(15)
    expect(getVoiceNoteSeekTarget(10, 'ArrowUp', 45)).toBe(15)
    expect(getVoiceNoteSeekTarget(10, 'ArrowLeft', 45)).toBe(5)
    expect(getVoiceNoteSeekTarget(10, 'ArrowDown', 45)).toBe(5)
  })

  it('clamps at both ends', () => {
    expect(getVoiceNoteSeekTarget(43, 'ArrowRight', 45)).toBe(45)
    expect(getVoiceNoteSeekTarget(2, 'ArrowLeft', 45)).toBe(0)
  })

  it('jumps with Home / End', () => {
    expect(getVoiceNoteSeekTarget(20, 'Home', 45)).toBe(0)
    expect(getVoiceNoteSeekTarget(20, 'End', 45)).toBe(45)
  })

  it('honours a custom step', () => {
    expect(getVoiceNoteSeekTarget(10, 'ArrowRight', 45, 1)).toBe(11)
  })

  it('returns null for keys it does not handle', () => {
    expect(getVoiceNoteSeekTarget(10, 'Enter', 45)).toBeNull()
    expect(getVoiceNoteSeekTarget(10, 'a', 45)).toBeNull()
  })

  it('stays at 0 while the duration is unknown', () => {
    expect(getVoiceNoteSeekTarget(0, 'ArrowRight', 0)).toBe(0)
    expect(getVoiceNoteSeekTarget(0, 'End', 0)).toBe(0)
  })
})

describe('getVoiceNoteTimeFromPointer', () => {
  const rect = { left: 100, width: 200 }

  it('maps clientX across the track to a time', () => {
    expect(getVoiceNoteTimeFromPointer(100, rect, 40)).toBe(0)
    expect(getVoiceNoteTimeFromPointer(150, rect, 40)).toBe(10)
    expect(getVoiceNoteTimeFromPointer(300, rect, 40)).toBe(40)
  })

  it('clamps pointers outside the track', () => {
    expect(getVoiceNoteTimeFromPointer(50, rect, 40)).toBe(0)
    expect(getVoiceNoteTimeFromPointer(500, rect, 40)).toBe(40)
  })

  it('is 0 for a zero-width (unmeasured) track', () => {
    expect(getVoiceNoteTimeFromPointer(150, { left: 0, width: 0 }, 40)).toBe(0)
  })
})

describe('playback rate', () => {
  it('cycles 1 → 1.5 → 2 → 1', () => {
    expect(VOICE_NOTE_PLAYBACK_RATES).toEqual([1, 1.5, 2])
    expect(getNextVoiceNotePlaybackRate(1)).toBe(1.5)
    expect(getNextVoiceNotePlaybackRate(1.5)).toBe(2)
    expect(getNextVoiceNotePlaybackRate(2)).toBe(1)
  })

  it('restarts the cycle from a rate outside it', () => {
    expect(getNextVoiceNotePlaybackRate(0.75)).toBe(1)
  })

  it('accepts a custom cycle and survives an empty one', () => {
    expect(getNextVoiceNotePlaybackRate(1, [1, 1.25])).toBe(1.25)
    expect(getNextVoiceNotePlaybackRate(1, [])).toBe(1)
  })

  it('normalizes unusable rates to normal speed', () => {
    expect(normalizeVoiceNotePlaybackRate(1.5)).toBe(1.5)
    expect(normalizeVoiceNotePlaybackRate(0)).toBe(1)
    expect(normalizeVoiceNotePlaybackRate(-2)).toBe(1)
    expect(normalizeVoiceNotePlaybackRate(Number.NaN)).toBe(1)
    expect(normalizeVoiceNotePlaybackRate(undefined)).toBe(1)
  })

  it('formats as "1×" / "1.5×" / "2×"', () => {
    expect(formatVoiceNotePlaybackRate(1)).toBe('1×')
    expect(formatVoiceNotePlaybackRate(1.5)).toBe('1.5×')
    expect(formatVoiceNotePlaybackRate(2)).toBe('2×')
  })
})

describe('transitionVoiceNoteState', () => {
  const cases: Array<[VoiceNoteState, VoiceNoteMediaEvent, VoiceNoteState]> = [
    ['idle', 'loadstart', 'loading'],
    ['error', 'loadstart', 'loading'],
    ['playing', 'loadstart', 'loading'],
    ['loading', 'loadedmetadata', 'idle'],
    ['playing', 'loadedmetadata', 'playing'],
    ['idle', 'play', 'playing'],
    ['paused', 'play', 'playing'],
    ['ended', 'play', 'playing'],
    ['loading', 'playing', 'playing'],
    ['error', 'play', 'error'],
    ['playing', 'pause', 'paused'],
    ['ended', 'pause', 'ended'],
    ['idle', 'pause', 'idle'],
    ['playing', 'ended', 'ended'],
    ['error', 'ended', 'error'],
    ['ended', 'seeked', 'paused'],
    ['playing', 'seeked', 'playing'],
    ['paused', 'seeked', 'paused'],
    ['playing', 'error', 'error'],
    ['loading', 'error', 'error'],
    ['error', 'emptied', 'idle'],
    ['playing', 'emptied', 'idle'],
  ]

  it.each(cases)('%s + %s → %s', (from, event, to) => {
    expect(transitionVoiceNoteState(from, event)).toBe(to)
  })

  it('walks a full lifecycle: load → play → pause → play → end → seek back', () => {
    const events: VoiceNoteMediaEvent[] = [
      'loadstart',
      'loadedmetadata',
      'play',
      'pause',
      'play',
      'pause',
      'ended',
      'seeked',
    ]
    const visited = events.reduce<VoiceNoteState[]>(
      (acc, event) => [...acc, transitionVoiceNoteState(acc[acc.length - 1], event)],
      ['idle'],
    )
    expect(visited).toEqual([
      'idle',
      'loading',
      'idle',
      'playing',
      'paused',
      'playing',
      'paused',
      'ended',
      'paused',
    ])
  })
})

describe('deriveVoiceNoteState', () => {
  const base = { readyState: 0, networkState: 0, paused: true, ended: false, hasError: false }

  it('reads error first, then ended', () => {
    expect(deriveVoiceNoteState({ ...base, hasError: true, ended: true })).toBe('error')
    expect(deriveVoiceNoteState({ ...base, readyState: 4, ended: true })).toBe('ended')
  })

  it('is loading while fetching without metadata, idle before any fetch', () => {
    expect(deriveVoiceNoteState({ ...base, networkState: 2 })).toBe('loading')
    expect(deriveVoiceNoteState(base)).toBe('idle')
  })

  it('is idle when ready and paused, playing when ready and not paused', () => {
    expect(deriveVoiceNoteState({ ...base, readyState: 1 })).toBe('idle')
    expect(deriveVoiceNoteState({ ...base, readyState: 4, paused: false })).toBe('playing')
  })
})

describe('getVoiceNotePrimaryAction', () => {
  it('pauses only while playing', () => {
    expect(getVoiceNotePrimaryAction('playing')).toBe('pause')
    for (const state of ['idle', 'loading', 'paused', 'ended', 'error'] as const) {
      expect(getVoiceNotePrimaryAction(state)).toBe('play')
    }
  })
})

describe('getVoiceNoteSliderProps', () => {
  it('returns slider ARIA in whole seconds with the readable value text', () => {
    expect(getVoiceNoteSliderProps({ currentTime: 12.7, duration: 45.9, label: 'Seek' })).toEqual({
      role: 'slider',
      'aria-label': 'Seek',
      'aria-valuemin': 0,
      'aria-valuemax': 45,
      'aria-valuenow': 12,
      'aria-valuetext': '0:12 of 0:45',
      'aria-orientation': 'horizontal',
    })
  })

  it('clamps the value into range and handles an unknown duration', () => {
    const over = getVoiceNoteSliderProps({ currentTime: 99, duration: 45, label: 'Seek' })
    expect(over['aria-valuenow']).toBe(45)
    const unknown = getVoiceNoteSliderProps({ currentTime: 5, duration: Number.NaN, label: 'Seek' })
    expect(unknown['aria-valuemax']).toBe(0)
    expect(unknown['aria-valuenow']).toBe(0)
  })

  it('lets the caller override the value text', () => {
    const props = getVoiceNoteSliderProps({
      currentTime: 12,
      duration: 45,
      label: 'Seek',
      getAriaValueText: (now, total) => `${now}s / ${total}s`,
    })
    expect(props['aria-valuetext']).toBe('12s / 45s')
  })

  it('marks itself aria-disabled when disabled', () => {
    expect(getVoiceNoteSliderProps({ currentTime: 0, duration: 1, label: 'Seek', disabled: true })['aria-disabled']).toBe(true)
  })
})

describe('labels and status', () => {
  it('merges overrides onto the defaults', () => {
    const labels = resolveVoiceNoteLabels({ play: 'Abspielen' })
    expect(labels.play).toBe('Abspielen')
    expect(labels.pause).toBe(DEFAULT_VOICE_NOTE_LABELS.pause)
  })

  it('has a status message only while loading or in error', () => {
    expect(getVoiceNoteStatusMessage('loading', DEFAULT_VOICE_NOTE_LABELS)).toBe(DEFAULT_VOICE_NOTE_LABELS.loading)
    expect(getVoiceNoteStatusMessage('error', DEFAULT_VOICE_NOTE_LABELS)).toBe(DEFAULT_VOICE_NOTE_LABELS.error)
    expect(getVoiceNoteStatusMessage('playing', DEFAULT_VOICE_NOTE_LABELS)).toBeNull()
  })
})

describe('styles', () => {
  it('uses string variants and token classes', () => {
    expect(voiceNoteVariants()).toContain('border-border')
    expect(voiceNoteVariants({ error: 'true' })).toContain('border-destructive')
    expect(voiceNoteTrackVariants()).toContain('focus-visible:ring-2')
    expect(voiceNoteTrackVariants({ disabled: 'true' })).toContain('cursor-not-allowed')
  })
})
