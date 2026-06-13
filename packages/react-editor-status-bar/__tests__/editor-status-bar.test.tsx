import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { EditorStatusBar } from '../src/editor-status-bar.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(EditorStatusBar, props))

describe('EditorStatusBar (SSR)', () => {
  it('renders role="status" for live-region semantics', () => {
    const html = render({ line: 1, col: 1 })
    expect(html).toContain('role="status"')
  })

  it('renders aria-live="polite"', () => {
    const html = render({ line: 1, col: 1 })
    expect(html).toContain('aria-live="polite"')
  })

  it('formats cursor position from line/col convenience props', () => {
    const html = render({ line: 17, col: 1 })
    expect(html).toContain('Ln 17, Col 1')
  })

  it('renders language and encoding on the right side', () => {
    const html = render({ language: 'Python 3.11.4', encoding: 'UTF-8' })
    expect(html).toContain('Python 3.11.4')
    expect(html).toContain('UTF-8')
  })

  it('renders all convenience props as segments', () => {
    const html = render({
      line: 17,
      col: 1,
      indentation: 'Spaces: 4',
      language: 'Python 3.11.4',
      encoding: 'UTF-8',
      eol: 'LF',
      status: 'Auto-saved',
    })
    expect(html).toContain('Ln 17, Col 1')
    expect(html).toContain('Spaces: 4')
    expect(html).toContain('Python 3.11.4')
    expect(html).toContain('UTF-8')
    expect(html).toContain('LF')
    expect(html).toContain('Auto-saved')
  })

  it('uses explicit segments when provided, ignoring convenience props', () => {
    const segments = [
      { id: 'custom', label: 'Custom Segment', align: 'left' as const },
    ]
    const html = render({ segments, line: 99, col: 99 })
    expect(html).toContain('Custom Segment')
    expect(html).not.toContain('Ln 99, Col 99')
  })

  it('renders with no segments without crashing', () => {
    const html = render({})
    expect(html).toContain('role="status"')
  })
})
