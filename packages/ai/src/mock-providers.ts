import type { AIProvider, GenerateOptions, TTSProvider, TTSOptions } from './types.js'

export interface MockAIResponses {
  text?: string[]
  json?: unknown[]
}

export interface MockTTSProviderExtended extends TTSProvider {
  speakCalls: Array<{ text: string; opts?: TTSOptions }>
  stopCalls: number
}

/**
 * createMockAIProvider — returns an AIProvider that returns canned responses.
 * Used for testing without real API calls.
 */
export function createMockAIProvider(
  name: string = 'mock',
  responses?: MockAIResponses,
): AIProvider {
  let textIndex = 0
  let jsonIndex = 0

  const textResponses = responses?.text ?? ['Mock AI response']
  const jsonResponses = responses?.json ?? [{ mock: true }]

  return {
    name,
    supportsVision: false,

    async generateText(_prompt: string, _opts?: GenerateOptions): Promise<string> {
      const response = textResponses[Math.min(textIndex, textResponses.length - 1)]
      textIndex++
      return response
    },

    async generateJSON<T = unknown>(_prompt: string, _opts?: GenerateOptions): Promise<T> {
      const response = jsonResponses[Math.min(jsonIndex, jsonResponses.length - 1)]
      jsonIndex++
      return response as T
    },
  }
}

/**
 * createMockTTSProvider — returns a TTSProvider that tracks calls for assertion.
 * Used for testing without real speech synthesis.
 */
export function createMockTTSProvider(
  name: string = 'mock-tts',
): MockTTSProviderExtended {
  const provider: MockTTSProviderExtended = {
    name,
    isSupported: true,
    speakCalls: [],
    stopCalls: 0,

    speak(text: string, opts?: TTSOptions): void {
      provider.speakCalls.push({ text, opts })
    },

    stop(): void {
      provider.stopCalls++
    },
  }

  return provider
}
