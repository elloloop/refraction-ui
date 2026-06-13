'use client'

import * as React from 'react'
import { TestResults } from '@refraction-ui/react-test-results'
import type { TestResultData } from '@refraction-ui/react-test-results'

interface TestResultsExamplesProps {
  section: 'all-passing' | 'with-failures' | 'with-skipped'
}

const allPassingResults: TestResultData[] = [
  { id: '1', name: 'adds two positive numbers', status: 'pass', durationMs: 3 },
  { id: '2', name: 'handles zero as operand', status: 'pass', durationMs: 2 },
  { id: '3', name: 'handles negative numbers', status: 'pass', durationMs: 4 },
]

const withFailuresResults: TestResultData[] = [
  { id: '1', name: 'adds two positive numbers', status: 'pass', durationMs: 3 },
  {
    id: '2',
    name: 'handles overflow correctly',
    status: 'fail',
    expected: '0',
    actual: 'Infinity',
    message: 'Expected 0 but received Infinity',
    durationMs: 2,
  },
  { id: '3', name: 'handles negative numbers', status: 'pass', durationMs: 4 },
]

const withSkippedResults: TestResultData[] = [
  { id: '1', name: 'adds two positive numbers', status: 'pass', durationMs: 3 },
  { id: '2', name: 'handles zero as operand', status: 'pass', durationMs: 2 },
  {
    id: '3',
    name: 'handles floating point precision',
    status: 'skip',
    message: 'Skipped: pending spec clarification',
  },
]

export function TestResultsExamples({ section }: TestResultsExamplesProps) {
  if (section === 'all-passing') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <TestResults results={allPassingResults} />
      </div>
    )
  }

  if (section === 'with-failures') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <TestResults results={withFailuresResults} />
      </div>
    )
  }

  if (section === 'with-skipped') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <TestResults results={withSkippedResults} />
      </div>
    )
  }

  return null
}
