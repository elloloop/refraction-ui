import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StickyNote } from '../src/sticky-note.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(StickyNote, props))

describe('StickyNote (SSR)', () => {
  it('renders with role=group', () => {
    const html = render({ color: 'yellow', text: 'Hello' })
    expect(html).toContain('role="group"')
  })

  it('sets data-color attribute', () => {
    const html = render({ color: 'blue', text: 'Note' })
    expect(html).toContain('data-color="blue"')
  })

  it('renders text content', () => {
    const html = render({ color: 'green', text: 'My note text' })
    expect(html).toContain('My note text')
  })

  it('renders author chip when provided', () => {
    const html = render({ color: 'pink', text: 'Note', author: 'Alice' })
    expect(html).toContain('Alice')
  })

  it('does not render author chip when omitted', () => {
    const html = render({ color: 'yellow', text: 'No author' })
    expect(html).not.toContain('<span')
  })

  it('positions via x and y inline style', () => {
    const html = render({ color: 'purple', text: 'Positioned', x: 100, y: 200 })
    expect(html).toContain('left')
    expect(html).toContain('top')
    expect(html).toContain('100')
    expect(html).toContain('200')
  })

  it('renders a textarea when onTextChange is provided', () => {
    const html = render({ color: 'orange', text: 'Edit me', onTextChange: () => {} })
    expect(html).toContain('<textarea')
  })

  it('renders static text (no textarea) without onTextChange', () => {
    const html = render({ color: 'yellow', text: 'Static text' })
    expect(html).not.toContain('<textarea')
    expect(html).toContain('Static text')
  })

  it('defaults to yellow color when no color is given', () => {
    const html = render({ text: 'Default' })
    expect(html).toContain('data-color="yellow"')
  })
})
