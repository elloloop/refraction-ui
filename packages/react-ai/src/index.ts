// AI Provider and hook
export { AIProvider, useAI } from './ai-provider.js'
export type { AIProviderProps, AIContextValue } from './ai-provider.js'

// TTS Provider and hook
export { TTSProvider, useTTS } from './tts-provider.js'
export type { TTSProviderProps, TTSContextValue } from './tts-provider.js'

// Re-export core types for convenience
export type {
  AIProvider as AIProviderInterface,
  GenerateOptions,
  TTSProvider as TTSProviderInterface,
  TTSOptions,
  RouterFn,
} from '@refraction-ui/ai'
