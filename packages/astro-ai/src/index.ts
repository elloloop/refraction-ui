export { default as AIScript } from './AIScript.astro'
export { default as TTSScript } from './TTSScript.astro'

// Re-export core types and factories for convenience
export {
  createAI,
  createTTS,
  type AIConfig,
  type TTSConfig,
  type AIAPI,
  type TTSAPI,
  type AIProvider,
  type TTSProvider,
  type GenerateOptions,
  type TTSOptions,
} from '@refraction-ui/ai'
