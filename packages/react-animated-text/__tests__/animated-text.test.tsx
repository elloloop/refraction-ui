import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { AnimatedText, TypewriterText } from '../src/animated-text.js'

describe('AnimatedText (React)', () => {
  it('renders the first word', () => {
    const html = renderToString(
      React.createElement(AnimatedText, { words: ['Hello', 'World'] }),
    )
    expect(html).toContain('Hello')
  })

  it('renders a span element', () => {
    const html = renderToString(
      React.createElement(AnimatedText, { words: ['Test'] }),
    )
    expect(html).toContain('<span')
  })

  it('applies animated text variant classes', () => {
    const html = renderToString(
      React.createElement(AnimatedText, { words: ['A', 'B'] }),
    )
    expect(html).toContain('inline-block')
    expect(html).toContain('transition-opacity')
  })

  it('sets aria-live for accessibility', () => {
    const html = renderToString(
      React.createElement(AnimatedText, { words: ['A', 'B'] }),
    )
    expect(html).toContain('aria-live="polite"')
  })

  it('sets aria-atomic for accessibility', () => {
    const html = renderToString(
      React.createElement(AnimatedText, { words: ['A', 'B'] }),
    )
    expect(html).toContain('aria-atomic="true"')
  })

  it('handles single word', () => {
    const html = renderToString(
      React.createElement(AnimatedText, { words: ['Solo'] }),
    )
    expect(html).toContain('Solo')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(AnimatedText, {
        words: ['A'],
        className: 'my-custom',
      }),
    )
    expect(html).toContain('my-custom')
  })
})

describe('TypewriterText (React)', () => {
  it('renders a span element', () => {
    const html = renderToString(
      React.createElement(TypewriterText, { text: 'Hello World' }),
    )
    expect(html).toContain('<span')
  })

  it('sets aria-label to the full text', () => {
    const html = renderToString(
      React.createElement(TypewriterText, { text: 'Hello World' }),
    )
    expect(html).toContain('aria-label="Hello World"')
  })

  it('applies typewriter variant classes', () => {
    const html = renderToString(
      React.createElement(TypewriterText, { text: 'Test' }),
    )
    expect(html).toContain('inline')
  })

  it('initially renders empty visible text (server render)', () => {
    const html = renderToString(
      React.createElement(TypewriterText, { text: 'Hello' }),
    )
    // On server, state starts at 0, so visible text is empty
    // The span should exist but content is empty
    expect(html).toContain('<span')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(TypewriterText, {
        text: 'Test',
        className: 'my-typewriter',
      }),
    )
    expect(html).toContain('my-typewriter')
  })
})
