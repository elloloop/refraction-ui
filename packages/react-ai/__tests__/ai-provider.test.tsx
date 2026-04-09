import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { AIProvider, useAI } from '../src/ai-provider.js'
import { createMockAIProvider } from '@elloloop/ai'

describe('AIProvider (SSR)', () => {
  it('renders children', () => {
    const html = renderToString(
      React.createElement(AIProvider, null,
        React.createElement('div', null, 'AI App'),
      ),
    )
    expect(html).toContain('AI App')
  })

  it('renders with default config', () => {
    const html = renderToString(
      React.createElement(AIProvider, null,
        React.createElement('span', null, 'Hello'),
      ),
    )
    expect(html).toContain('Hello')
  })

  it('renders with custom config', () => {
    const html = renderToString(
      React.createElement(AIProvider, { default: 'openai' },
        React.createElement('span', null, 'Configured'),
      ),
    )
    expect(html).toContain('Configured')
  })

  it('accepts providers prop to pre-register providers', () => {
    const providers = {
      mock: createMockAIProvider('mock'),
    }
    const html = renderToString(
      React.createElement(AIProvider, { providers },
        React.createElement('span', null, 'With providers'),
      ),
    )
    expect(html).toContain('With providers')
  })
})

describe('useAI (SSR)', () => {
  function TestConsumer() {
    const ai = useAI()
    return React.createElement('div', null,
      React.createElement('span', { 'data-generating': String(ai.isGenerating) }),
      React.createElement('span', { 'data-providers': JSON.stringify(ai.providers) }),
      React.createElement('span', null, typeof ai.generateText === 'function' ? 'has-generateText' : 'missing'),
      React.createElement('span', null, typeof ai.generateJSON === 'function' ? 'has-generateJSON' : 'missing'),
    )
  }

  it('provides generateText function', () => {
    const html = renderToString(
      React.createElement(AIProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('has-generateText')
  })

  it('provides generateJSON function', () => {
    const html = renderToString(
      React.createElement(AIProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('has-generateJSON')
  })

  it('provides providers list', () => {
    const html = renderToString(
      React.createElement(AIProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('data-providers')
  })

  it('isGenerating is false initially', () => {
    const html = renderToString(
      React.createElement(AIProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('data-generating="false"')
  })

  it('shows registered providers from providers prop', () => {
    const providers = {
      openai: createMockAIProvider('openai'),
      anthropic: createMockAIProvider('anthropic'),
    }
    const html = renderToString(
      React.createElement(AIProvider, { providers },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('openai')
    expect(html).toContain('anthropic')
  })

  it('throws when used outside AIProvider', () => {
    expect(() => {
      renderToString(React.createElement(TestConsumer))
    }).toThrow(/useAI.*AIProvider/i)
  })
})
