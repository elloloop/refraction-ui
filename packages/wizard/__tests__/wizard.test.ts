import { describe, it, expect } from 'vitest'
import {
  createWizard,
  getStepState,
  getNextIndex,
  getPrevIndex,
  canAdvance,
  wizardProgress,
  type WizardStep,
} from '../src/index.js'

const steps: WizardStep[] = [
  { id: 'goal', label: 'Goal' },
  { id: 'region', label: 'Region' },
  { id: 'expectations', label: 'Expectations' },
  { id: 'placement', label: 'Placement', optional: true },
  { id: 'account', label: 'Account' },
]

describe('getStepState', () => {
  it('marks steps before currentIndex as complete', () => {
    const states = getStepState(steps, 2)
    expect(states[0].status).toBe('complete')
    expect(states[1].status).toBe('complete')
  })

  it('marks the step at currentIndex as current', () => {
    const states = getStepState(steps, 2)
    expect(states[2].status).toBe('current')
  })

  it('marks steps after currentIndex as upcoming', () => {
    const states = getStepState(steps, 2)
    expect(states[3].status).toBe('upcoming')
    expect(states[4].status).toBe('upcoming')
  })

  it('passes through step and index fields', () => {
    const states = getStepState(steps, 0)
    expect(states[0].step).toBe(steps[0])
    expect(states[0].index).toBe(0)
    expect(states[4].index).toBe(4)
  })

  it('returns all upcoming when currentIndex is 0', () => {
    const states = getStepState(steps, 0)
    expect(states[0].status).toBe('current')
    expect(states.slice(1).every((s) => s.status === 'upcoming')).toBe(true)
  })

  it('returns all complete except last when at last step', () => {
    const last = steps.length - 1
    const states = getStepState(steps, last)
    expect(states[last].status).toBe('current')
    expect(states.slice(0, last).every((s) => s.status === 'complete')).toBe(true)
  })
})

describe('getNextIndex', () => {
  it('advances by 1', () => {
    expect(getNextIndex(1, 5)).toBe(2)
  })

  it('clamps at the last step', () => {
    expect(getNextIndex(4, 5)).toBe(4)
  })

  it('returns currentIndex for empty wizard', () => {
    expect(getNextIndex(0, 0)).toBe(0)
  })
})

describe('getPrevIndex', () => {
  it('moves back by 1', () => {
    expect(getPrevIndex(3)).toBe(2)
  })

  it('clamps at 0', () => {
    expect(getPrevIndex(0)).toBe(0)
  })
})

describe('canAdvance', () => {
  it('returns true when not on the last step', () => {
    expect(canAdvance(0, 5)).toBe(true)
    expect(canAdvance(3, 5)).toBe(true)
  })

  it('returns false when on the last step', () => {
    expect(canAdvance(4, 5)).toBe(false)
  })

  it('returns false for empty wizard', () => {
    expect(canAdvance(0, 0)).toBe(false)
  })
})

describe('wizardProgress', () => {
  it('returns 0 at the start', () => {
    expect(wizardProgress(0, 4)).toBe(0)
  })

  it('returns fractional progress mid-flow', () => {
    expect(wizardProgress(2, 4)).toBe(0.5)
    expect(wizardProgress(3, 4)).toBe(0.75)
  })

  it('returns 1 when currentIndex equals count (flow complete)', () => {
    expect(wizardProgress(4, 4)).toBe(1)
  })

  it('returns 0 for an empty wizard', () => {
    expect(wizardProgress(0, 0)).toBe(0)
  })
})

describe('createWizard', () => {
  it('sets role=group and data-step/orientation attributes', () => {
    const { ariaProps, dataAttributes } = createWizard({
      currentIndex: 2,
      count: 5,
      orientation: 'vertical',
    })
    expect(ariaProps.role).toBe('group')
    expect(dataAttributes['data-step']).toBe('2')
    expect(dataAttributes['data-orientation']).toBe('vertical')
    expect(dataAttributes['data-count']).toBe('5')
  })

  it('defaults to index 0 and vertical orientation', () => {
    const { dataAttributes } = createWizard()
    expect(dataAttributes['data-step']).toBe('0')
    expect(dataAttributes['data-orientation']).toBe('vertical')
  })

  it('omits data-count when count is 0 (unset)', () => {
    const { dataAttributes } = createWizard({ currentIndex: 0 })
    expect(dataAttributes['data-count']).toBeUndefined()
  })
})
