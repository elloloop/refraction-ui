import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@elloloop/shared'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
} from '../src/input-group.js'

beforeEach(() => {
  resetIdCounter()
})

describe('InputGroup (React)', () => {
  it('renders a div with role=group', () => {
    const html = renderToString(React.createElement(InputGroup, null, 'content'))
    expect(html).toContain('role="group"')
    expect(html).toContain('content')
  })

  it('applies horizontal classes by default', () => {
    const html = renderToString(React.createElement(InputGroup, null, 'content'))
    expect(html).toContain('flex-row')
  })

  it('applies vertical classes', () => {
    const html = renderToString(
      React.createElement(InputGroup, { orientation: 'vertical' }, 'content'),
    )
    expect(html).toContain('flex-col')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(InputGroup, { className: 'my-class' }, 'content'),
    )
    expect(html).toContain('my-class')
  })

  it('passes through aria-label', () => {
    const html = renderToString(
      React.createElement(InputGroup, { 'aria-label': 'Search field' }, 'content'),
    )
    expect(html).toContain('aria-label="Search field"')
  })

  it('sets data-orientation', () => {
    const html = renderToString(
      React.createElement(InputGroup, { orientation: 'vertical' }, 'content'),
    )
    expect(html).toContain('data-orientation="vertical"')
  })
})

describe('InputGroupAddon (React)', () => {
  it('renders addon with styling classes', () => {
    const html = renderToString(React.createElement(InputGroupAddon, null, '$'))
    expect(html).toContain('$')
    expect(html).toContain('bg-muted')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(InputGroupAddon, { className: 'addon-class' }, '@'),
    )
    expect(html).toContain('addon-class')
  })
})

describe('InputGroupText (React)', () => {
  it('renders a span', () => {
    const html = renderToString(React.createElement(InputGroupText, null, 'Label'))
    expect(html).toContain('<span')
    expect(html).toContain('Label')
  })
})

describe('InputGroupButton (React)', () => {
  it('renders a button with type=button by default', () => {
    const html = renderToString(React.createElement(InputGroupButton, null, 'Go'))
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('Go')
  })

  it('accepts type override', () => {
    const html = renderToString(
      React.createElement(InputGroupButton, { type: 'submit' }, 'Submit'),
    )
    expect(html).toContain('type="submit"')
  })
})
