import { describe, it, expect } from 'vitest'
import {
  summarizeTests,
  createTestResults,
  type TestResultData,
} from '../src/index.js'

const pass = (id: string): TestResultData => ({
  id,
  name: `Test ${id}`,
  status: 'pass',
})
const fail = (id: string): TestResultData => ({
  id,
  name: `Test ${id}`,
  status: 'fail',
  expected: 'true',
  actual: 'false',
  message: 'Expected true but received false',
})
const skip = (id: string): TestResultData => ({
  id,
  name: `Test ${id}`,
  status: 'skip',
  message: 'Skipped: not implemented',
})

describe('summarizeTests', () => {
  it('counts passing tests correctly', () => {
    const summary = summarizeTests([pass('1'), pass('2'), pass('3')])
    expect(summary.total).toBe(3)
    expect(summary.passed).toBe(3)
    expect(summary.failed).toBe(0)
    expect(summary.skipped).toBe(0)
    expect(summary.allPassed).toBe(true)
  })

  it('counts failing tests and sets allPassed false', () => {
    const summary = summarizeTests([pass('1'), fail('2'), pass('3')])
    expect(summary.total).toBe(3)
    expect(summary.passed).toBe(2)
    expect(summary.failed).toBe(1)
    expect(summary.skipped).toBe(0)
    expect(summary.allPassed).toBe(false)
  })

  it('counts skipped tests and sets allPassed false', () => {
    const summary = summarizeTests([pass('1'), pass('2'), skip('3')])
    expect(summary.total).toBe(3)
    expect(summary.passed).toBe(2)
    expect(summary.failed).toBe(0)
    expect(summary.skipped).toBe(1)
    expect(summary.allPassed).toBe(false)
  })

  it('counts mixed results correctly', () => {
    const summary = summarizeTests([pass('1'), fail('2'), skip('3'), pass('4')])
    expect(summary.total).toBe(4)
    expect(summary.passed).toBe(2)
    expect(summary.failed).toBe(1)
    expect(summary.skipped).toBe(1)
    expect(summary.allPassed).toBe(false)
  })

  it('returns zero totals for an empty list', () => {
    const summary = summarizeTests([])
    expect(summary.total).toBe(0)
    expect(summary.passed).toBe(0)
    expect(summary.failed).toBe(0)
    expect(summary.skipped).toBe(0)
    expect(summary.allPassed).toBe(false)
  })
})

describe('createTestResults', () => {
  it('returns role="list" in ariaProps', () => {
    const { ariaProps } = createTestResults()
    expect(ariaProps.role).toBe('list')
  })

  it('returns data-component attribute', () => {
    const { dataAttributes } = createTestResults()
    expect(dataAttributes['data-component']).toBe('test-results')
  })
})
