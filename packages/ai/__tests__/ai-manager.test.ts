import { describe, it, expect, vi } from 'vitest'
import { createAI } from '../src/ai-manager.js'
import { createMockAIProvider } from '../src/mock-providers.js'
import type { AIProvider, GenerateOptions, RouterFn } from '../src/types.js'

describe('createAI', () => {
  // --- Provider registration ---
  describe('provider registration', () => {
    it('starts with no providers', () => {
      const ai = createAI()
      expect(ai.providers).toEqual([])
    })

    it('addProvider registers a provider', () => {
      const ai = createAI()
      ai.addProvider('openai', createMockAIProvider('openai'))
      expect(ai.providers).toContain('openai')
    })

    it('addProvider registers multiple providers', () => {
      const ai = createAI()
      ai.addProvider('openai', createMockAIProvider('openai'))
      ai.addProvider('anthropic', createMockAIProvider('anthropic'))
      expect(ai.providers).toEqual(['openai', 'anthropic'])
    })

    it('removeProvider removes a provider', () => {
      const ai = createAI()
      ai.addProvider('openai', createMockAIProvider('openai'))
      ai.addProvider('anthropic', createMockAIProvider('anthropic'))
      ai.removeProvider('openai')
      expect(ai.providers).toEqual(['anthropic'])
    })

    it('removeProvider is a no-op for unknown provider', () => {
      const ai = createAI()
      ai.addProvider('openai', createMockAIProvider('openai'))
      ai.removeProvider('nonexistent')
      expect(ai.providers).toEqual(['openai'])
    })

    it('addProvider overwrites existing provider with same name', () => {
      const ai = createAI()
      const p1 = createMockAIProvider('openai', { text: ['from p1'] })
      const p2 = createMockAIProvider('openai', { text: ['from p2'] })
      ai.addProvider('openai', p1)
      ai.addProvider('openai', p2)
      expect(ai.providers).toEqual(['openai'])
    })
  })

  // --- No-provider error ---
  describe('no-provider error', () => {
    it('generateText throws descriptive error when no providers', async () => {
      const ai = createAI()
      await expect(ai.generateText('hello')).rejects.toThrow(/no.*provider/i)
    })

    it('generateJSON throws descriptive error when no providers', async () => {
      const ai = createAI()
      await expect(ai.generateJSON('hello')).rejects.toThrow(/no.*provider/i)
    })
  })

  // --- Resolution order ---
  describe('resolution order', () => {
    it('uses first available provider when no default', async () => {
      const ai = createAI()
      ai.addProvider('openai', createMockAIProvider('openai', { text: ['openai-response'] }))
      ai.addProvider('anthropic', createMockAIProvider('anthropic', { text: ['anthropic-response'] }))
      const result = await ai.generateText('hello')
      expect(result).toBe('openai-response')
    })

    it('uses default provider when configured', async () => {
      const ai = createAI({ default: 'anthropic' })
      ai.addProvider('openai', createMockAIProvider('openai', { text: ['openai-response'] }))
      ai.addProvider('anthropic', createMockAIProvider('anthropic', { text: ['anthropic-response'] }))
      const result = await ai.generateText('hello')
      expect(result).toBe('anthropic-response')
    })

    it('explicit opts.provider overrides default', async () => {
      const ai = createAI({ default: 'anthropic' })
      ai.addProvider('openai', createMockAIProvider('openai', { text: ['openai-response'] }))
      ai.addProvider('anthropic', createMockAIProvider('anthropic', { text: ['anthropic-response'] }))
      const result = await ai.generateText('hello', { provider: 'openai' })
      expect(result).toBe('openai-response')
    })

    it('router overrides default but not explicit', async () => {
      const router: RouterFn<GenerateOptions> = (_req, _ctx) => 'openai'
      const ai = createAI({ default: 'anthropic', router })
      ai.addProvider('openai', createMockAIProvider('openai', { text: ['openai-response'] }))
      ai.addProvider('anthropic', createMockAIProvider('anthropic', { text: ['anthropic-response'] }))
      const result = await ai.generateText('hello')
      expect(result).toBe('openai-response')
    })

    it('explicit opts.provider overrides router', async () => {
      const router: RouterFn<GenerateOptions> = () => 'openai'
      const ai = createAI({ default: 'anthropic', router })
      ai.addProvider('openai', createMockAIProvider('openai', { text: ['openai-response'] }))
      ai.addProvider('anthropic', createMockAIProvider('anthropic', { text: ['anthropic-response'] }))
      const result = await ai.generateText('hello', { provider: 'anthropic' })
      expect(result).toBe('anthropic-response')
    })
  })

  // --- Custom router ---
  describe('custom router', () => {
    it('router receives request and context', async () => {
      const routerFn = vi.fn().mockReturnValue('openai')
      const ai = createAI({ default: 'anthropic', router: routerFn })
      ai.addProvider('openai', createMockAIProvider('openai'))
      ai.addProvider('anthropic', createMockAIProvider('anthropic'))
      await ai.generateText('hello', { intent: 'summarize' })

      expect(routerFn).toHaveBeenCalledTimes(1)
      const [request, context] = routerFn.mock.calls[0]
      expect(request).toMatchObject({ intent: 'summarize' })
      expect(context.providers).toEqual(['openai', 'anthropic'])
      expect(context.default).toBe('anthropic')
    })

    it('router can route based on intent', async () => {
      const router: RouterFn<GenerateOptions> = (req) => {
        return req.intent === 'vision' ? 'vision-ai' : 'text-ai'
      }
      const ai = createAI({ router })
      ai.addProvider('text-ai', createMockAIProvider('text-ai', { text: ['text-result'] }))
      ai.addProvider('vision-ai', createMockAIProvider('vision-ai', { text: ['vision-result'] }))

      expect(await ai.generateText('describe', { intent: 'vision' })).toBe('vision-result')
      expect(await ai.generateText('summarize', { intent: 'text' })).toBe('text-result')
    })
  })

  // --- Fallback chains ---
  describe('fallback chains', () => {
    it('falls back to next provider on error', async () => {
      const failing: AIProvider = {
        name: 'failing',
        supportsVision: false,
        generateText: async () => { throw new Error('API error') },
        generateJSON: async () => { throw new Error('API error') },
      }
      const ai = createAI({ default: 'failing', fallback: ['backup'] })
      ai.addProvider('failing', failing)
      ai.addProvider('backup', createMockAIProvider('backup', { text: ['backup-response'] }))
      const result = await ai.generateText('hello')
      expect(result).toBe('backup-response')
    })

    it('tries multiple fallbacks in order', async () => {
      const fail1: AIProvider = {
        name: 'fail1',
        supportsVision: false,
        generateText: async () => { throw new Error('fail1 error') },
        generateJSON: async () => { throw new Error('fail1 error') },
      }
      const fail2: AIProvider = {
        name: 'fail2',
        supportsVision: false,
        generateText: async () => { throw new Error('fail2 error') },
        generateJSON: async () => { throw new Error('fail2 error') },
      }
      const ai = createAI({ default: 'fail1', fallback: ['fail2', 'success'] })
      ai.addProvider('fail1', fail1)
      ai.addProvider('fail2', fail2)
      ai.addProvider('success', createMockAIProvider('success', { text: ['success!'] }))
      const result = await ai.generateText('hello')
      expect(result).toBe('success!')
    })

    it('throws last error if all fallbacks fail', async () => {
      const fail: AIProvider = {
        name: 'fail',
        supportsVision: false,
        generateText: async () => { throw new Error('fail error') },
        generateJSON: async () => { throw new Error('fail error') },
      }
      const fail2: AIProvider = {
        name: 'fail2',
        supportsVision: false,
        generateText: async () => { throw new Error('fail2 error') },
        generateJSON: async () => { throw new Error('fail2 error') },
      }
      const ai = createAI({ default: 'fail', fallback: ['fail2'] })
      ai.addProvider('fail', fail)
      ai.addProvider('fail2', fail2)
      await expect(ai.generateText('hello')).rejects.toThrow('fail2 error')
    })

    it('fallback works for generateJSON too', async () => {
      const failing: AIProvider = {
        name: 'failing',
        supportsVision: false,
        generateText: async () => { throw new Error('API error') },
        generateJSON: async () => { throw new Error('API error') },
      }
      const ai = createAI({ default: 'failing', fallback: ['backup'] })
      ai.addProvider('failing', failing)
      ai.addProvider('backup', createMockAIProvider('backup', { json: [{ result: 'ok' }] }))
      const result = await ai.generateJSON<{ result: string }>('give json')
      expect(result).toEqual({ result: 'ok' })
    })

    it('skips fallback providers that are not registered', async () => {
      const failing: AIProvider = {
        name: 'failing',
        supportsVision: false,
        generateText: async () => { throw new Error('API error') },
        generateJSON: async () => { throw new Error('API error') },
      }
      const ai = createAI({ default: 'failing', fallback: ['nonexistent', 'backup'] })
      ai.addProvider('failing', failing)
      ai.addProvider('backup', createMockAIProvider('backup', { text: ['backup-response'] }))
      const result = await ai.generateText('hello')
      expect(result).toBe('backup-response')
    })

    it('fallback not triggered when explicit provider succeeds', async () => {
      const ai = createAI({ fallback: ['backup'] })
      ai.addProvider('primary', createMockAIProvider('primary', { text: ['primary-response'] }))
      ai.addProvider('backup', createMockAIProvider('backup', { text: ['backup-response'] }))
      const result = await ai.generateText('hello', { provider: 'primary' })
      expect(result).toBe('primary-response')
    })
  })

  // --- Error handling ---
  describe('error handling', () => {
    it('throws when explicit provider is not registered', async () => {
      const ai = createAI()
      ai.addProvider('openai', createMockAIProvider('openai'))
      await expect(ai.generateText('hello', { provider: 'nonexistent' })).rejects.toThrow(/not found|not registered/i)
    })

    it('throws when default provider is not registered', async () => {
      const ai = createAI({ default: 'nonexistent' })
      ai.addProvider('openai', createMockAIProvider('openai'))
      // should still work - falls back to first available
      // Actually, if default is set but not registered, it should throw
      await expect(ai.generateText('hello')).rejects.toThrow()
    })

    it('propagates provider errors when no fallback', async () => {
      const failing: AIProvider = {
        name: 'failing',
        supportsVision: false,
        generateText: async () => { throw new Error('API rate limit') },
        generateJSON: async () => { throw new Error('API rate limit') },
      }
      const ai = createAI()
      ai.addProvider('failing', failing)
      await expect(ai.generateText('hello')).rejects.toThrow('API rate limit')
    })
  })

  // --- generateJSON ---
  describe('generateJSON', () => {
    it('returns typed JSON from provider', async () => {
      const ai = createAI()
      ai.addProvider('mock', createMockAIProvider('mock', { json: [{ name: 'Alice', age: 30 }] }))
      const result = await ai.generateJSON<{ name: string; age: number }>('get user')
      expect(result).toEqual({ name: 'Alice', age: 30 })
    })

    it('uses resolution order for generateJSON', async () => {
      const ai = createAI({ default: 'second' })
      ai.addProvider('first', createMockAIProvider('first', { json: [{ from: 'first' }] }))
      ai.addProvider('second', createMockAIProvider('second', { json: [{ from: 'second' }] }))
      const result = await ai.generateJSON<{ from: string }>('get data')
      expect(result).toEqual({ from: 'second' })
    })
  })

  // --- Config defaults ---
  describe('config', () => {
    it('createAI works with no config', () => {
      const ai = createAI()
      expect(ai).toBeDefined()
      expect(ai.providers).toEqual([])
    })

    it('createAI works with empty config', () => {
      const ai = createAI({})
      expect(ai).toBeDefined()
    })
  })
})
