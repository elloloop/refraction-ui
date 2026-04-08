/** AI provider interface — implemented by adapter packages (OpenAI, Anthropic, etc.) */
export interface AIProvider {
  name: string
  generateText(prompt: string, opts?: GenerateOptions): Promise<string>
  generateJSON<T = unknown>(prompt: string, opts?: GenerateOptions): Promise<T>
  supportsVision: boolean
}

/** Options passed to generate calls */
export interface GenerateOptions {
  provider?: string
  model?: string
  intent?: string
  image?: unknown
  maxTokens?: number
  temperature?: number
  [key: string]: unknown
}

/** TTS provider interface — implemented by TTS adapter packages */
export interface TTSProvider {
  name: string
  speak(text: string, opts?: TTSOptions): void
  stop(): void
  isSupported: boolean
}

/** Options passed to TTS calls */
export interface TTSOptions {
  provider?: string
  voice?: string
  language?: string
  speed?: number
  onEnd?: () => void
  [key: string]: unknown
}

/** Router function — picks a provider name given a request and context */
export type RouterFn<T> = (
  request: T,
  context: { providers: string[]; default: string },
) => string

/** Config for createAI */
export interface AIConfig {
  default?: string
  fallback?: string[]
  router?: RouterFn<GenerateOptions>
}

/** Config for createTTS */
export interface TTSConfig {
  default?: string
  router?: RouterFn<TTSOptions>
}

/** Return type of createAI */
export interface AIAPI {
  providers: string[]
  generateText(prompt: string, opts?: GenerateOptions): Promise<string>
  generateJSON<T = unknown>(prompt: string, opts?: GenerateOptions): Promise<T>
  addProvider(name: string, provider: AIProvider): void
  removeProvider(name: string): void
}

/** Return type of createTTS */
export interface TTSAPI {
  providers: string[]
  speak(text: string, opts?: TTSOptions): void
  stop(): void
  addProvider(name: string, provider: TTSProvider): void
}
