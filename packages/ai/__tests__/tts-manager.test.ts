import { describe, it, expect, vi } from 'vitest'
import { createTTS } from '../src/tts-manager.js'
import { createMockTTSProvider } from '../src/mock-providers.js'
import type { TTSProvider, TTSOptions, RouterFn } from '../src/types.js'

describe('createTTS', () => {
  // --- Provider registration ---
  describe('provider registration', () => {
    it('starts with no providers', () => {
      const tts = createTTS()
      expect(tts.providers).toEqual([])
    })

    it('addProvider registers a provider', () => {
      const tts = createTTS()
      tts.addProvider('browser', createMockTTSProvider('browser'))
      expect(tts.providers).toContain('browser')
    })

    it('addProvider registers multiple providers', () => {
      const tts = createTTS()
      tts.addProvider('browser', createMockTTSProvider('browser'))
      tts.addProvider('elevenlabs', createMockTTSProvider('elevenlabs'))
      expect(tts.providers).toEqual(['browser', 'elevenlabs'])
    })

    it('addProvider overwrites existing provider with same name', () => {
      const tts = createTTS()
      tts.addProvider('browser', createMockTTSProvider('browser'))
      tts.addProvider('browser', createMockTTSProvider('browser'))
      expect(tts.providers).toEqual(['browser'])
    })
  })

  // --- No-provider error ---
  describe('no-provider error', () => {
    it('speak throws descriptive error when no providers', () => {
      const tts = createTTS()
      expect(() => tts.speak('hello')).toThrow(/no.*provider/i)
    })
  })

  // --- Resolution order ---
  describe('resolution order', () => {
    it('uses first available provider when no default', () => {
      const tts = createTTS()
      const p1 = createMockTTSProvider('browser')
      const p2 = createMockTTSProvider('elevenlabs')
      tts.addProvider('browser', p1)
      tts.addProvider('elevenlabs', p2)
      tts.speak('hello')
      expect(p1.speakCalls).toHaveLength(1)
      expect(p2.speakCalls).toHaveLength(0)
    })

    it('uses default provider when configured', () => {
      const tts = createTTS({ default: 'elevenlabs' })
      const p1 = createMockTTSProvider('browser')
      const p2 = createMockTTSProvider('elevenlabs')
      tts.addProvider('browser', p1)
      tts.addProvider('elevenlabs', p2)
      tts.speak('hello')
      expect(p1.speakCalls).toHaveLength(0)
      expect(p2.speakCalls).toHaveLength(1)
    })

    it('explicit opts.provider overrides default', () => {
      const tts = createTTS({ default: 'elevenlabs' })
      const p1 = createMockTTSProvider('browser')
      const p2 = createMockTTSProvider('elevenlabs')
      tts.addProvider('browser', p1)
      tts.addProvider('elevenlabs', p2)
      tts.speak('hello', { provider: 'browser' })
      expect(p1.speakCalls).toHaveLength(1)
      expect(p2.speakCalls).toHaveLength(0)
    })

    it('router overrides default but not explicit', () => {
      const router: RouterFn<TTSOptions> = () => 'browser'
      const tts = createTTS({ default: 'elevenlabs', router })
      const p1 = createMockTTSProvider('browser')
      const p2 = createMockTTSProvider('elevenlabs')
      tts.addProvider('browser', p1)
      tts.addProvider('elevenlabs', p2)
      tts.speak('hello')
      expect(p1.speakCalls).toHaveLength(1)
      expect(p2.speakCalls).toHaveLength(0)
    })

    it('explicit opts.provider overrides router', () => {
      const router: RouterFn<TTSOptions> = () => 'browser'
      const tts = createTTS({ default: 'elevenlabs', router })
      const p1 = createMockTTSProvider('browser')
      const p2 = createMockTTSProvider('elevenlabs')
      tts.addProvider('browser', p1)
      tts.addProvider('elevenlabs', p2)
      tts.speak('hello', { provider: 'elevenlabs' })
      expect(p1.speakCalls).toHaveLength(0)
      expect(p2.speakCalls).toHaveLength(1)
    })
  })

  // --- Custom router ---
  describe('custom router', () => {
    it('router receives request and context', () => {
      const routerFn = vi.fn().mockReturnValue('browser')
      const tts = createTTS({ default: 'elevenlabs', router: routerFn })
      tts.addProvider('browser', createMockTTSProvider('browser'))
      tts.addProvider('elevenlabs', createMockTTSProvider('elevenlabs'))
      tts.speak('hello', { voice: 'en-US' })

      expect(routerFn).toHaveBeenCalledTimes(1)
      const [request, context] = routerFn.mock.calls[0]
      expect(request).toMatchObject({ voice: 'en-US' })
      expect(context.providers).toEqual(['browser', 'elevenlabs'])
      expect(context.default).toBe('elevenlabs')
    })

    it('router can route based on language', () => {
      const router: RouterFn<TTSOptions> = (req) => {
        return req.language === 'ja' ? 'japanese-tts' : 'default-tts'
      }
      const tts = createTTS({ router })
      const jpProvider = createMockTTSProvider('japanese-tts')
      const defaultProvider = createMockTTSProvider('default-tts')
      tts.addProvider('default-tts', defaultProvider)
      tts.addProvider('japanese-tts', jpProvider)

      tts.speak('konnichiwa', { language: 'ja' })
      tts.speak('hello', { language: 'en' })

      expect(jpProvider.speakCalls).toHaveLength(1)
      expect(defaultProvider.speakCalls).toHaveLength(1)
    })
  })

  // --- Stop ---
  describe('stop', () => {
    it('stop calls stop on all providers', () => {
      const tts = createTTS()
      const p1 = createMockTTSProvider('browser')
      const p2 = createMockTTSProvider('elevenlabs')
      tts.addProvider('browser', p1)
      tts.addProvider('elevenlabs', p2)
      tts.stop()
      expect(p1.stopCalls).toBe(1)
      expect(p2.stopCalls).toBe(1)
    })

    it('stop works with no providers', () => {
      const tts = createTTS()
      expect(() => tts.stop()).not.toThrow()
    })
  })

  // --- Error handling ---
  describe('error handling', () => {
    it('throws when explicit provider is not registered', () => {
      const tts = createTTS()
      tts.addProvider('browser', createMockTTSProvider('browser'))
      expect(() => tts.speak('hello', { provider: 'nonexistent' })).toThrow(/not found|not registered/i)
    })

    it('throws when default provider is not registered', () => {
      const tts = createTTS({ default: 'nonexistent' })
      tts.addProvider('browser', createMockTTSProvider('browser'))
      expect(() => tts.speak('hello')).toThrow()
    })
  })

  // --- Config defaults ---
  describe('config', () => {
    it('createTTS works with no config', () => {
      const tts = createTTS()
      expect(tts).toBeDefined()
      expect(tts.providers).toEqual([])
    })

    it('createTTS works with empty config', () => {
      const tts = createTTS({})
      expect(tts).toBeDefined()
    })
  })

  // --- Speak passes text and opts ---
  describe('speak behavior', () => {
    it('passes text to provider', () => {
      const tts = createTTS()
      const provider = createMockTTSProvider('browser')
      tts.addProvider('browser', provider)
      tts.speak('Hello world')
      expect(provider.speakCalls[0].text).toBe('Hello world')
    })

    it('passes options to provider', () => {
      const tts = createTTS()
      const provider = createMockTTSProvider('browser')
      tts.addProvider('browser', provider)
      tts.speak('Hello', { voice: 'en-US', speed: 1.5 })
      expect(provider.speakCalls[0].opts).toMatchObject({ voice: 'en-US', speed: 1.5 })
    })
  })
})
