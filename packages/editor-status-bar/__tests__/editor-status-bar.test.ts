import { describe, it, expect } from 'vitest'
import {
  formatCursorPosition,
  partitionSegments,
  createEditorStatusBar,
  type StatusSegment,
} from '../src/index.js'

describe('formatCursorPosition', () => {
  it('formats line and column as IDE string', () => {
    expect(formatCursorPosition(17, 1)).toBe('Ln 17, Col 1')
  })

  it('handles double-digit column', () => {
    expect(formatCursorPosition(1, 42)).toBe('Ln 1, Col 42')
  })
})

describe('partitionSegments', () => {
  const segments: StatusSegment[] = [
    { id: 'cursor', label: 'Ln 17, Col 1', align: 'left' },
    { id: 'indent', label: 'Spaces: 4', align: 'left' },
    { id: 'lang', label: 'Python 3.11.4', align: 'right' },
    { id: 'encoding', label: 'UTF-8', align: 'right' },
    { id: 'eol', label: 'LF' }, // defaults to left
  ]

  it('splits by align, preserving order', () => {
    const { left, right } = partitionSegments(segments)
    expect(left.map((s) => s.id)).toEqual(['cursor', 'indent', 'eol'])
    expect(right.map((s) => s.id)).toEqual(['lang', 'encoding'])
  })

  it('returns empty groups for an empty array', () => {
    const { left, right } = partitionSegments([])
    expect(left).toHaveLength(0)
    expect(right).toHaveLength(0)
  })

  it('treats undefined align as left', () => {
    const { left } = partitionSegments([{ id: 'a', label: 'A' }])
    expect(left[0].id).toBe('a')
  })
})

describe('createEditorStatusBar', () => {
  it('returns role="status" for live-region semantics', () => {
    const { ariaProps } = createEditorStatusBar()
    expect(ariaProps.role).toBe('status')
  })

  it('returns aria-live="polite" so updates are non-interruptive', () => {
    const { ariaProps } = createEditorStatusBar()
    expect(ariaProps['aria-live']).toBe('polite')
  })

  it('includes a data-component attribute for styling hooks', () => {
    const { dataAttributes } = createEditorStatusBar()
    expect(dataAttributes['data-component']).toBe('editor-status-bar')
  })
})
