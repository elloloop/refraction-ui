'use client'

import * as React from 'react'
import { Terminal } from '@refraction-ui/react-terminal'
import type { TerminalLine } from '@refraction-ui/react-terminal'

interface TerminalExamplesProps {
  section: 'basic' | 'error' | 'mixed'
}

const basicLines: TerminalLine[] = [
  { id: '1', kind: 'command', text: 'python solution.py' },
  { id: '2', kind: 'stdout', text: 'Reading input...' },
  { id: '3', kind: 'stdout', text: 'Processing 1000 items' },
  { id: '4', kind: 'success', text: 'All tests passed (3/3)' },
]

const errorLines: TerminalLine[] = [
  { id: '1', kind: 'command', text: 'python solution.py' },
  { id: '2', kind: 'stdout', text: 'Running test cases...' },
  { id: '3', kind: 'stderr', text: 'AssertionError: expected [1, 2, 3] but got [3, 2, 1]' },
  { id: '4', kind: 'stderr', text: 'FAIL  test_case_2' },
  { id: '5', kind: 'info', text: '1/3 tests passed' },
]

const mixedLines: TerminalLine[] = [
  { id: '1', kind: 'command', text: 'python solution.py < input.txt' },
  { id: '2', kind: 'stdout', text: 'Case 1: 42' },
  { id: '3', kind: 'stdout', text: 'Case 2: 17' },
  { id: '4', kind: 'stderr', text: 'FAIL  Case 3: expected 99, got 100' },
  { id: '5', kind: 'success', text: 'PASS  Case 4: 0' },
  { id: '6', kind: 'info', text: '--- 3/4 tests passed, 1 failed ---' },
]

export function TerminalExamples({ section }: TerminalExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Terminal lines={basicLines} aria-label="Basic run output" />
      </div>
    )
  }

  if (section === 'error') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Terminal lines={errorLines} aria-label="Error run output" />
      </div>
    )
  }

  if (section === 'mixed') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Terminal lines={mixedLines} aria-label="Mixed run output" promptSymbol="❯" />
      </div>
    )
  }

  return null
}
