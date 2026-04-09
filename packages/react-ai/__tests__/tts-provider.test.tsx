import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { TTSProvider, useTTS } from '../src/tts-provider.js'
import { createMockTTSProvider } from '@refraction-ui/ai'

describe('TTSProvider (SSR)', () => {
  it('renders children', () => {
    const html = renderToString(
      React.createElement(TTSProvider, null,
        React.createElement('div', null, 'TTS App'),
      ),
    )
    expect(html).toContain('TTS App')
  })

  it('renders with default config', () => {
    const html = renderToString(
      React.createElement(TTSProvider, null,
        React.createElement('span', null, 'Hello TTS'),
      ),
    )
    expect(html).toContain('Hello TTS')
  })

  it('renders with custom config', () => {
    const html = renderToString(
      React.createElement(TTSProvider, { default: 'browser' },
        React.createElement('span', null, 'Configured TTS'),
      ),
    )
    expect(html).toContain('Configured TTS')
  })

  it('accepts providers prop to pre-register providers', () => {
    const providers = {
      browser: createMockTTSProvider('browser'),
    }
    const html = renderToString(
      React.createElement(TTSProvider, { providers },
        React.createElement('span', null, 'With TTS providers'),
      ),
    )
    expect(html).toContain('With TTS providers')
  })
})

describe('useTTS (SSR)', () => {
  function TestConsumer() {
    const tts = useTTS()
    return React.createElement('div', null,
      React.createElement('span', { 'data-speaking': String(tts.isSpeaking) }),
      React.createElement('span', { 'data-providers': JSON.stringify(tts.providers) }),
      React.createElement('span', null, typeof tts.speak === 'function' ? 'has-speak' : 'missing'),
      React.createElement('span', null, typeof tts.stop === 'function' ? 'has-stop' : 'missing'),
    )
  }

  it('provides speak function', () => {
    const html = renderToString(
      React.createElement(TTSProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('has-speak')
  })

  it('provides stop function', () => {
    const html = renderToString(
      React.createElement(TTSProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('has-stop')
  })

  it('provides providers list', () => {
    const html = renderToString(
      React.createElement(TTSProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('data-providers')
  })

  it('isSpeaking is false initially', () => {
    const html = renderToString(
      React.createElement(TTSProvider, null,
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('data-speaking="false"')
  })

  it('shows registered providers from providers prop', () => {
    const providers = {
      browser: createMockTTSProvider('browser'),
      elevenlabs: createMockTTSProvider('elevenlabs'),
    }
    const html = renderToString(
      React.createElement(TTSProvider, { providers },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('browser')
    expect(html).toContain('elevenlabs')
  })

  it('throws when used outside TTSProvider', () => {
    expect(() => {
      renderToString(React.createElement(TestConsumer))
    }).toThrow(/useTTS.*TTSProvider/i)
  })
})
