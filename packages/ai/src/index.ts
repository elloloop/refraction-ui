// Types
export type {
  AIProvider,
  GenerateOptions,
  TTSProvider,
  TTSOptions,
  RouterFn,
  AIConfig,
  TTSConfig,
  AIAPI,
  TTSAPI,
} from './types.js'

// Managers
export { createAI } from './ai-manager.js'
export { createTTS } from './tts-manager.js'

// Mock providers (for testing)
export { createMockAIProvider, createMockTTSProvider } from './mock-providers.js'
export type { MockAIResponses, MockTTSProviderExtended } from './mock-providers.js'

// Utilities
export { sanitizeForSpeech } from './sanitizer.js'
