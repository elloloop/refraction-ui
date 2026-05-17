import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { useAI } from '../src/ai-provider.js'
import { useTTS } from '../src/tts-provider.js'

// react-ai is a footgun (provider-context-throw): useAI/useTTS throw outside
// their providers. Per docs/instrumentation/policy.md the throw is KEPT and a
// dev-only warn-once devWarn is added immediately before it.

function renderHook(hook: () => unknown): void {
  function Probe() {
    hook()
    return null
  }
  renderToString(React.createElement(Probe))
}

describe('react-ai devWarn footgun (useAI / useTTS outside provider)', () => {
  const originalEnv = process.env.NODE_ENV
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetDevFeedback()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    warnSpy.mockRestore()
    resetDevFeedback()
  })

  it('useAI: warns once in dev AND still throws', () => {
    process.env.NODE_ENV = 'development'
    expect(() => renderHook(useAI)).toThrow(
      'useAI must be used within an <AIProvider>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-ai/use-ai-outside-provider',
    )
  })

  it('useTTS: warns once in dev AND still throws', () => {
    process.env.NODE_ENV = 'development'
    expect(() => renderHook(useTTS)).toThrow(
      'useTTS must be used within a <TTSProvider>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-ai/use-tts-outside-provider',
    )
  })

  it('does NOT warn in production but still throws', () => {
    process.env.NODE_ENV = 'production'
    expect(() => renderHook(useAI)).toThrow(
      'useAI must be used within an <AIProvider>',
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
