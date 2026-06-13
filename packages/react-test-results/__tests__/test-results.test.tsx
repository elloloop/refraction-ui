import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { TestResults } from '../src/test-results.js'
import type { TestResultData } from '../src/test-results.js'

const render = (props: React.ComponentProps<typeof TestResults>) =>
  renderToString(React.createElement(TestResults, props))

const allPassResults: TestResultData[] = [
  { id: '1', name: 'adds two numbers', status: 'pass', durationMs: 5 },
  { id: '2', name: 'handles zero', status: 'pass', durationMs: 3 },
  { id: '3', name: 'handles negatives', status: 'pass', durationMs: 4 },
]

const mixedResults: TestResultData[] = [
  { id: '1', name: 'adds two numbers', status: 'pass', durationMs: 5 },
  {
    id: '2',
    name: 'handles overflow',
    status: 'fail',
    expected: '0',
    actual: 'Infinity',
    message: 'Expected 0 but received Infinity',
    durationMs: 2,
  },
  { id: '3', name: 'handles negatives', status: 'skip', message: 'Not yet implemented' },
]

describe('TestResults (SSR)', () => {
  it('renders the summary with pass count', () => {
    const html = render({ results: allPassResults, showSummary: true })
    expect(html).toContain('3/3 passed')
  })

  it('renders one listitem per result', () => {
    const html = render({ results: allPassResults })
    expect((html.match(/role="listitem"/g) ?? []).length).toBe(3)
  })

  it('renders the list container with role="list"', () => {
    const html = render({ results: allPassResults })
    expect(html).toContain('role="list"')
  })

  it('shows expected and actual values for a failed test', () => {
    const html = render({ results: mixedResults })
    expect(html).toContain('Infinity')
    expect(html).toContain('expected')
    expect(html).toContain('actual')
  })

  it('applies status-specific class tokens to rows', () => {
    const html = render({ results: mixedResults })
    // fail row contains destructive token class
    expect(html).toContain('bg-destructive/5')
    // pass row contains success token class
    expect(html).toContain('bg-success/5')
    // skip row contains muted token class
    expect(html).toContain('bg-muted/5')
  })

  it('shows fail count in summary when there are failures', () => {
    const html = render({ results: mixedResults, showSummary: true })
    expect(html).toContain('1 failed')
    expect(html).toContain('1 skipped')
  })

  it('omits summary bar when showSummary is false', () => {
    const html = render({ results: allPassResults, showSummary: false })
    expect(html).not.toContain('passed')
  })

  it('renders duration when provided', () => {
    const html = render({ results: allPassResults })
    expect(html).toContain('5 ms')
  })
})
