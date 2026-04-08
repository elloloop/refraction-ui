import { describe, it, expect, vi } from 'vitest'
import { createMockAIProvider, createMockTTSProvider } from '../src/mock-providers.js'

describe('createMockAIProvider', () => {
  it('returns a provider with default name "mock"', () => {
    const provider = createMockAIProvider()
    expect(provider.name).toBe('mock')
  })

  it('accepts a custom name', () => {
    const provider = createMockAIProvider('custom-ai')
    expect(provider.name).toBe('custom-ai')
  })

  it('supportsVision defaults to false', () => {
    const provider = createMockAIProvider()
    expect(provider.supportsVision).toBe(false)
  })

  it('generateText returns default response when no responses configured', async () => {
    const provider = createMockAIProvider()
    const result = await provider.generateText('hello')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('generateText returns canned responses in order', async () => {
    const provider = createMockAIProvider('mock', {
      text: ['first response', 'second response'],
    })
    expect(await provider.generateText('a')).toBe('first response')
    expect(await provider.generateText('b')).toBe('second response')
  })

  it('generateText cycles canned responses when exhausted', async () => {
    const provider = createMockAIProvider('mock', {
      text: ['only one'],
    })
    expect(await provider.generateText('a')).toBe('only one')
    expect(await provider.generateText('b')).toBe('only one')
  })

  it('generateJSON returns canned JSON responses', async () => {
    const data = { key: 'value', num: 42 }
    const provider = createMockAIProvider('mock', {
      json: [data],
    })
    const result = await provider.generateJSON<typeof data>('give me json')
    expect(result).toEqual(data)
  })

  it('generateJSON returns default object when no responses configured', async () => {
    const provider = createMockAIProvider()
    const result = await provider.generateJSON('give me json')
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('generateText passes opts through', async () => {
    const provider = createMockAIProvider()
    // Should not throw with options
    const result = await provider.generateText('hello', { model: 'gpt-4', maxTokens: 100 })
    expect(typeof result).toBe('string')
  })

  it('is a valid AIProvider interface', () => {
    const provider = createMockAIProvider()
    expect(provider).toHaveProperty('name')
    expect(provider).toHaveProperty('generateText')
    expect(provider).toHaveProperty('generateJSON')
    expect(provider).toHaveProperty('supportsVision')
    expect(typeof provider.generateText).toBe('function')
    expect(typeof provider.generateJSON).toBe('function')
  })
})

describe('createMockTTSProvider', () => {
  it('returns a provider with default name "mock-tts"', () => {
    const provider = createMockTTSProvider()
    expect(provider.name).toBe('mock-tts')
  })

  it('accepts a custom name', () => {
    const provider = createMockTTSProvider('browser-tts')
    expect(provider.name).toBe('browser-tts')
  })

  it('isSupported defaults to true', () => {
    const provider = createMockTTSProvider()
    expect(provider.isSupported).toBe(true)
  })

  it('speak does not throw', () => {
    const provider = createMockTTSProvider()
    expect(() => provider.speak('hello')).not.toThrow()
  })

  it('stop does not throw', () => {
    const provider = createMockTTSProvider()
    expect(() => provider.stop()).not.toThrow()
  })

  it('tracks speak calls', () => {
    const provider = createMockTTSProvider()
    provider.speak('hello world')
    provider.speak('goodbye')
    expect(provider.speakCalls).toHaveLength(2)
    expect(provider.speakCalls[0].text).toBe('hello world')
    expect(provider.speakCalls[1].text).toBe('goodbye')
  })

  it('tracks speak calls with options', () => {
    const provider = createMockTTSProvider()
    provider.speak('hello', { voice: 'en-US', speed: 1.5 })
    expect(provider.speakCalls[0].opts).toEqual({ voice: 'en-US', speed: 1.5 })
  })

  it('tracks stop calls', () => {
    const provider = createMockTTSProvider()
    provider.stop()
    provider.stop()
    expect(provider.stopCalls).toBe(2)
  })

  it('is a valid TTSProvider interface', () => {
    const provider = createMockTTSProvider()
    expect(provider).toHaveProperty('name')
    expect(provider).toHaveProperty('speak')
    expect(provider).toHaveProperty('stop')
    expect(provider).toHaveProperty('isSupported')
    expect(typeof provider.speak).toBe('function')
    expect(typeof provider.stop).toBe('function')
  })
})
