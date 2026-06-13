import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LiveCursors, Cursor } from '../src/live-cursors.js'
import type { CursorData } from '../src/live-cursors.js'

const render = (element: React.ReactElement) => renderToString(element)

const CURSORS: CursorData[] = [
  { id: 'user-1', name: 'Maya', x: 120, y: 80, color: '#E94560' },
  { id: 'user-2', name: 'Kwame', x: 340, y: 210, color: '#4CAF50' },
  { id: 'user-3', name: 'Camille', x: 220, y: 150 },
]

describe('LiveCursors (SSR)', () => {
  it('renders one cursor element per entry', () => {
    const html = render(<LiveCursors cursors={CURSORS} />)
    // Each cursor gets a data-cursor-name attribute
    expect((html.match(/data-cursor-name=/g) ?? []).length).toBe(3)
  })

  it('renders collaborator names in the label chips', () => {
    const html = render(<LiveCursors cursors={CURSORS} />)
    expect(html).toContain('Maya')
    expect(html).toContain('Kwame')
    expect(html).toContain('Camille')
  })

  it('positions cursors via left/top inline styles', () => {
    const html = render(<LiveCursors cursors={CURSORS} />)
    expect(html).toContain('left:120px')
    expect(html).toContain('top:80px')
    expect(html).toContain('left:340px')
    expect(html).toContain('top:210px')
  })

  it('applies explicit color to the SVG fill and label background', () => {
    const html = render(<LiveCursors cursors={[CURSORS[0]]} />)
    // #E94560 appears at least twice: SVG fill + label background
    const matches = (html.match(/#E94560/gi) ?? []).length
    expect(matches).toBeGreaterThanOrEqual(2)
  })

  it('assigns a color from the palette when cursor has no color', () => {
    const html = render(<LiveCursors cursors={[CURSORS[2]]} />)
    // Camille has no color — a palette hex should appear
    expect(html).toMatch(/#[0-9A-Fa-f]{6}/)
  })

  it('is aria-hidden (decorative overlay)', () => {
    const html = render(<LiveCursors cursors={CURSORS} />)
    expect(html).toContain('aria-hidden="true"')
  })

  it('accepts className and forwards extra props', () => {
    const html = render(
      <LiveCursors cursors={[]} className="my-overlay" data-testid="cursors" />,
    )
    expect(html).toContain('my-overlay')
    expect(html).toContain('data-testid="cursors"')
  })
})

describe('Cursor (SSR)', () => {
  it('renders the collaborator name', () => {
    const html = render(<Cursor name="Maya" x={10} y={20} color="#E94560" />)
    expect(html).toContain('Maya')
  })

  it('applies left/top from x/y props', () => {
    const html = render(<Cursor name="Test" x={55} y={77} color="#4CAF50" />)
    expect(html).toContain('left:55px')
    expect(html).toContain('top:77px')
  })
})
