// AI Service and provider function
export { RefractionAIService, provideAI } from "./ai.service";

// TTS Service and provider function
export { RefractionTTSService, provideTTS } from "./tts.service";

// Re-export core types for convenience
export type {
  AIProvider,
  GenerateOptions,
  TTSProvider,
  TTSOptions,
  RouterFn,
  AIConfig,
  TTSConfig,
} from "@refraction-ui/ai";
