import { describe, it, expect } from 'vitest'
import {
  createStepCard,
  isStepStatus,
  getStepStatusMeta,
  resolveStepStatusLabel,
  shouldAnnounceStepStatus,
  shouldShowStepCardLiveHint,
  formatStepStatusAnnouncement,
  normalizeInstructionSteps,
  normalizeStepCardTroubleshooting,
  STEP_STATUSES,
  DEFAULT_STEP_STATUS,
  stepCardVariants,
  stepStatusPillVariants,
  stepStatusIconVariants,
  stepStatusIconPaths,
  type StepStatus,
} from '../src/index.js'

describe('STEP_STATUSES / isStepStatus', () => {
  it('lists the five Flutter statuses', () => {
    expect(STEP_STATUSES).toEqual(['notDetermined', 'needed', 'checking', 'granted', 'failed'])
  })

  it('accepts every status and rejects anything else', () => {
    for (const status of STEP_STATUSES) expect(isStepStatus(status)).toBe(true)
    expect(isStepStatus('Granted')).toBe(false)
    expect(isStepStatus('')).toBe(false)
    expect(isStepStatus(undefined)).toBe(false)
    expect(isStepStatus(3)).toBe(false)
  })

  it('defaults to notDetermined', () => {
    expect(DEFAULT_STEP_STATUS).toBe('notDetermined')
  })
})

describe('getStepStatusMeta', () => {
  it('gives every status a distinct icon and tone (never colour alone)', () => {
    const icons = new Set(STEP_STATUSES.map((s) => getStepStatusMeta(s).icon))
    const tones = new Set(STEP_STATUSES.map((s) => getStepStatusMeta(s).tone))
    expect(icons.size).toBe(STEP_STATUSES.length)
    expect(tones.size).toBe(STEP_STATUSES.length)
  })

  it('uses the spinner only for checking', () => {
    const spinners = STEP_STATUSES.filter((s) => getStepStatusMeta(s).icon === 'spinner')
    expect(spinners).toEqual(['checking'])
  })

  it('maps granted to success and failed to danger', () => {
    expect(getStepStatusMeta('granted').tone).toBe('success')
    expect(getStepStatusMeta('failed').tone).toBe('danger')
    expect(getStepStatusMeta('needed').tone).toBe('attention')
  })

  it('has an icon path for every icon', () => {
    for (const status of STEP_STATUSES) {
      expect(stepStatusIconPaths[getStepStatusMeta(status).icon].length).toBeGreaterThan(0)
    }
  })
})

describe('resolveStepStatusLabel', () => {
  it('falls back to the default label', () => {
    expect(resolveStepStatusLabel('granted')).toBe('Granted')
    expect(resolveStepStatusLabel('notDetermined')).toBe('Not checked yet')
    expect(resolveStepStatusLabel('checking')).toBe('Checking…')
  })

  it('prefers a custom label, trimmed', () => {
    expect(resolveStepStatusLabel('granted', '  Allowed ')).toBe('Allowed')
  })

  it('ignores a blank custom label so the pill is never empty', () => {
    expect(resolveStepStatusLabel('failed', '   ')).toBe('Failed')
    expect(resolveStepStatusLabel('failed', '')).toBe('Failed')
  })
})

describe('shouldAnnounceStepStatus', () => {
  it('never announces the first render', () => {
    for (const status of STEP_STATUSES) {
      expect(shouldAnnounceStepStatus(undefined, status)).toBe(false)
    }
  })

  it('does not announce an unchanged status', () => {
    expect(shouldAnnounceStepStatus('needed', 'needed')).toBe(false)
  })

  it('announces every real change', () => {
    const pairs: Array<[StepStatus, StepStatus]> = [
      ['notDetermined', 'needed'],
      ['needed', 'checking'],
      ['checking', 'granted'],
      ['checking', 'failed'],
      ['failed', 'needed'],
    ]
    for (const [a, b] of pairs) expect(shouldAnnounceStepStatus(a, b)).toBe(true)
  })
})

describe('shouldShowStepCardLiveHint', () => {
  it('shows only while checking with a non-blank hint', () => {
    expect(shouldShowStepCardLiveHint('checking', 'Waiting…')).toBe(true)
    expect(shouldShowStepCardLiveHint('checking', '  ')).toBe(false)
    expect(shouldShowStepCardLiveHint('checking')).toBe(false)
    for (const status of STEP_STATUSES.filter((s) => s !== 'checking')) {
      expect(shouldShowStepCardLiveHint(status, 'Waiting…')).toBe(false)
    }
  })
})

describe('formatStepStatusAnnouncement', () => {
  it('names the step and its status', () => {
    expect(formatStepStatusAnnouncement({ title: 'Microphone', status: 'granted' })).toBe(
      'Microphone: Granted',
    )
  })

  it('uses the custom status label', () => {
    expect(
      formatStepStatusAnnouncement({ title: 'Microphone', status: 'failed', statusLabel: 'Denied' }),
    ).toBe('Microphone: Denied')
  })

  it('appends the live hint while checking', () => {
    expect(
      formatStepStatusAnnouncement({
        title: 'Screen recording',
        status: 'checking',
        liveHint: ' Toggle Refraction on in System Settings. ',
      }),
    ).toBe('Screen recording: Checking…. Toggle Refraction on in System Settings.')
  })

  it('drops the live hint for other statuses', () => {
    expect(
      formatStepStatusAnnouncement({ title: 'Mic', status: 'granted', liveHint: 'Waiting' }),
    ).toBe('Mic: Granted')
  })

  it('omits a blank title rather than reading a stray colon', () => {
    expect(formatStepStatusAnnouncement({ title: '  ', status: 'needed' })).toBe('Needed')
  })
})

describe('normalizeInstructionSteps', () => {
  it('returns [] for undefined or empty input', () => {
    expect(normalizeInstructionSteps(undefined)).toEqual([])
    expect(normalizeInstructionSteps([])).toEqual([])
  })

  it('drops blank steps and keeps order and markup', () => {
    expect(normalizeInstructionSteps(['**Open Settings**', ' ', '', 'Choose {app}'])).toEqual([
      '**Open Settings**',
      'Choose {app}',
    ])
  })
})

describe('normalizeStepCardTroubleshooting', () => {
  it('returns [] when absent or blank', () => {
    expect(normalizeStepCardTroubleshooting(undefined)).toEqual([])
    expect(normalizeStepCardTroubleshooting('   ')).toEqual([])
    expect(normalizeStepCardTroubleshooting(['', ' '])).toEqual([])
  })

  it('wraps a single string as one tip', () => {
    expect(normalizeStepCardTroubleshooting('Restart the app.')).toEqual(['Restart the app.'])
  })

  it('keeps non-blank tips in order', () => {
    expect(normalizeStepCardTroubleshooting(['A', '', 'B'])).toEqual(['A', 'B'])
  })
})

describe('createStepCard', () => {
  it('defaults to notDetermined and expanded', () => {
    const api = createStepCard()
    expect(api.status).toBe('notDetermined')
    expect(api.tone).toBe('neutral')
    expect(api.icon).toBe('pending')
    expect(api.dataAttributes).toEqual({
      'data-status': 'notDetermined',
      'data-tone': 'neutral',
      'data-expanded': 'true',
    })
  })

  it('reflects status and collapsed state', () => {
    const api = createStepCard({ status: 'checking', expanded: false })
    expect(api.icon).toBe('spinner')
    expect(api.dataAttributes['data-status']).toBe('checking')
    expect(api.dataAttributes['data-tone']).toBe('progress')
    expect(api.dataAttributes['data-expanded']).toBe('false')
  })

  it('is deterministic', () => {
    expect(createStepCard({ status: 'granted' })).toEqual(createStepCard({ status: 'granted' }))
  })
})

describe('styles', () => {
  it('pill tones use semantic token pairs', () => {
    expect(stepStatusPillVariants({ tone: 'success' })).toContain('bg-success text-success-foreground')
    expect(stepStatusPillVariants({ tone: 'danger' })).toContain('bg-destructive')
    expect(stepStatusPillVariants({ tone: 'neutral' })).toContain('bg-muted')
  })

  it('spinner stops under reduced motion', () => {
    const spinning = stepStatusIconVariants({ spinning: 'true' })
    expect(spinning).toContain('animate-spin')
    expect(spinning).toContain('motion-reduce:animate-none')
    expect(stepStatusIconVariants({ spinning: 'false' })).not.toContain('animate-spin')
  })

  it('card padding follows expanded', () => {
    expect(stepCardVariants({ expanded: 'true' })).toContain('p-5')
    expect(stepCardVariants({ expanded: 'false' })).toContain('py-4')
  })
})
