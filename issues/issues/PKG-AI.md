---
id: PKG-AI
track: packages
depends_on: ["PKG-CORE"]
size: L
labels: [feat]
status: pending
---

## Summary

Create `@elloloop/ai` package — **multi-provider** AI abstraction (Gemini, OpenAI, Anthropic) and TTS system. Unlike auth (single-provider), AI uses **multiple providers simultaneously** with intent-based routing and fallback chains.

**Provider SDKs are internal.** Consumer never imports `openai`, `@anthropic-ai/sdk`, or `@google/generative-ai`. All providers auto-detected from env vars. Routing configured in `.refractionrc`. See ADR 0003.

### Multi-Provider Pattern

AI and TTS are **multi-provider services** — all configured providers are initialized and available simultaneously. The consumer can:

1. **Let config/defaults handle routing** — simple calls go to the default provider
2. **Call a specific provider by name** — `{ provider: 'anthropic' }` when business logic knows what it wants
3. **Supply custom routing logic** — a function that decides which provider to use based on any app-specific criteria (surface area, cost, token count, user tier, content type, etc.)
4. **Get automatic fallback** — if the chosen provider fails, try next in chain

```typescript
import { createAI, createTTS } from '@elloloop/ai'

const ai = createAI()

// 1. Simple — goes to default provider
await ai.generateText('Summarize this')

// 2. Explicit provider by name — when you know what you want
await ai.generateText('Analyze this', { provider: 'anthropic' })
await ai.generateText('Quick answer', { provider: 'openai', model: 'gpt-4o-mini' })
await ai.generateText('Describe image', { provider: 'gemini', image: buf })

// 3. With hint — routes via configured rules or custom router
await ai.generateText('Complex problem', { intent: 'reasoning' })

// 4. Fallback is automatic
await ai.generateJSON('Extract data', { schema })  // if default fails, tries next

// List what's available
ai.providers  // ['openai', 'anthropic', 'gemini'] — whatever has env vars configured
```

```typescript
// Custom routing — app's business logic decides
const ai = createAI({
  router: (request, providers) => {
    // Any business logic the app needs
    if (request.image) return 'gemini'
    if (request.estimatedTokens > 50000) return 'anthropic'
    if (request.user?.tier === 'free') return 'openai'  // cheapest
    if (request.surfaceArea === 'chat') return 'anthropic'
    if (request.surfaceArea === 'code') return 'openai'
    return providers.default
  }
})

// TTS — same pattern
const tts = createTTS({
  router: (request, providers) => {
    if (request.language === 'en' && request.quality === 'high') return 'elevenlabs'
    if (['hi', 'te', 'ta'].includes(request.language)) return 'google'
    return 'browser'  // always available fallback
  }
})

// Or just call by name
await tts.speak('Hello', { provider: 'elevenlabs', voice: 'rachel' })
await tts.speak('నమస్కారం', { provider: 'google', language: 'te' })
```

### Config

```jsonc
// .refractionrc — providers auto-detect from env vars
{
  "ai": {
    "providers": {},           // auto-detect from OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.
    "default": "openai",       // which provider for simple calls
    "fallback": ["openai", "anthropic", "gemini"]  // try order on failure
  },
  "tts": {
    "providers": {},
    "default": "browser",
    "fallback": ["browser"]
  }
}
```

The config provides **defaults and fallback**. App-specific routing logic lives in the app via the `router` function. Both are optional — it works with just env vars.

## Source References

### AI Provider System
From **elloloop/learnloop** `lib/ai/`:
- `index.ts` — Factory: `createAIProvider(config)` returning unified `AIProvider` interface
- `types.ts` — `AIProvider` interface with `generateText()`, `generateJSON()`, vision support
- `safety.ts` — Child safety system prompt, explanation style variations
- `fallback.ts` — Multi-tier fallback (cheapest model first, upgrades on failure)
- `providers/gemini.ts` — Google Gemini provider implementation
- `providers/openai.ts` — OpenAI provider implementation
- `providers/anthropic.ts` — Anthropic provider implementation

### TTS System
From **elloloop/learnloop** `lib/tts/`:
- `index.ts` — `createTTSProvider(type)` factory for browser/API/ElevenLabs/OpenAI/Google
- `browser-tts.ts` — `BrowserTTSProvider` using Web Speech API with smart voice selection
- `api-tts.ts` — `ApiTTSProvider` using fetch to REST audio endpoints

From **elloloop/learnloop** `hooks/useTutoringTTS.ts`:
- TTS lifecycle hook with LaTeX sanitization, playback speed scaling, language-aware voice selection

From **elloloop/learnloop** `lib/tutoring/tts-sanitizer.ts`:
- 30+ regex rules converting LaTeX/markdown to speakable English

## Acceptance Criteria

### AI (multi-provider)
- [ ] `createAI()` auto-detects all available providers from env vars
- [ ] `ai.providers` exposes list of available provider names (strings)
- [ ] `generateText()` and `generateJSON()` work identically regardless of provider
- [ ] **Explicit provider by name**: `{ provider: 'anthropic' }` calls that provider directly
- [ ] **Explicit model**: `{ provider: 'openai', model: 'gpt-4o-mini' }` targets a specific model
- [ ] **Custom router function**: `createAI({ router: (req, ctx) => 'anthropic' })` — app business logic decides
- [ ] Router receives arbitrary context from `GenerateOptions` (surfaceArea, userTier, estimatedTokens, etc.)
- [ ] **Fallback chains**: if chosen provider fails, automatically tries next in configured order
- [ ] **Intent hints**: `{ intent: 'reasoning' }` works as input to router or default config rules
- [ ] Vision support: auto-routes to vision-capable provider when image provided (unless explicit)
- [ ] Child safety system prompt injection (configurable)
- [ ] Graceful degradation: if no API keys present, AI features disabled (no crash)

### TTS (multi-provider)
- [ ] `createTTS()` auto-detects available TTS providers
- [ ] `tts.providers` exposes list of available provider names
- [ ] **Explicit provider by name**: `{ provider: 'elevenlabs', voice: 'rachel' }`
- [ ] **Custom router function**: app decides based on language, quality, user tier, etc.
- [ ] Browser TTS always available as fallback (zero config, zero deps)
- [ ] Smart voice selection per language per provider
- [ ] LaTeX/markdown to speakable text sanitizer (30+ rules)
- [ ] Playback speed scaling
- [ ] `speak(text, opts)` and `stop()` lifecycle

### Shared
- [ ] All provider SDKs are `dependencies` (bundled, invisible to consumer)
- [ ] Config from `.refractionrc` or env vars
- [ ] TypeScript strict types with `[key: string]: unknown` for custom router context
- [ ] Unit tests for routing, fallback, explicit provider calls, custom router
- [ ] No provider SDK loaded until first call (lazy dynamic import)

## Internal Package Structure

```
packages/ai/
  src/
    # AI
    ai/
      types.ts              # AIProvider interface, GenerateOptions, Intent
      router.ts             # Intent-based routing + fallback chain
      adapters/
        openai.ts           # Bundles openai SDK
        anthropic.ts        # Bundles @anthropic-ai/sdk
        gemini.ts           # Bundles @google/generative-ai
        resolve.ts          # Auto-detect from env vars, init all available
      safety.ts             # Content safety prompts
    
    # TTS
    tts/
      types.ts              # TTSProvider interface
      router.ts             # Language-based routing + fallback
      adapters/
        browser.ts          # Web Speech API (zero deps, always available)
        elevenlabs.ts       # Bundles ElevenLabs SDK
        google.ts           # Bundles Google TTS
        openai.ts           # Bundles OpenAI TTS
        resolve.ts          # Auto-detect from env vars
      sanitizer.ts          # LaTeX/markdown → speakable text
    
    config.ts               # Read routing config from .refractionrc / env
    index.ts                # Public API: createAI(), createTTS()
```

## Public API

```typescript
// @elloloop/ai
export function createAI(config?: AIConfig): AI
export function createTTS(config?: TTSConfig): TTS

export interface AI {
  /** All available provider names (auto-detected from env) */
  providers: string[]
  
  generateText(prompt: string, opts?: GenerateOptions): Promise<string>
  generateJSON<T>(prompt: string, opts?: GenerateOptions & { schema?: ZodSchema<T> }): Promise<T>
}

export interface GenerateOptions {
  provider?: string       // explicit: 'openai', 'anthropic', 'gemini'
  model?: string          // explicit model within provider: 'gpt-4o-mini'
  intent?: string         // hint for router: 'fast', 'reasoning', 'vision'
  image?: Buffer | string // image input (auto-routes to vision-capable if no explicit provider)
  
  // App can pass arbitrary context for custom router
  [key: string]: unknown  // surfaceArea, userTier, estimatedTokens, etc.
}

export interface TTS {
  providers: string[]
  
  speak(text: string, opts?: TTSOptions): void
  stop(): void
}

export interface TTSOptions {
  provider?: string       // explicit: 'elevenlabs', 'google', 'browser'
  voice?: string          // specific voice within provider
  language?: string       // for routing
  speed?: number
  onEnd?: () => void
  [key: string]: unknown  // custom router context
}

export interface AIConfig {
  /** Custom routing function — app's business logic decides which provider */
  router?: (request: GenerateOptions, context: RouterContext) => string
  /** Fallback chain — try these providers in order on failure */
  fallback?: string[]
  /** Default provider for simple calls */
  default?: string
}

export interface RouterContext {
  /** Available provider names */
  providers: string[]
  /** Configured default provider */
  default: string
}

export type { AIConfig, TTSConfig }
```

## Dependencies

- Provider SDKs as `dependencies` (NOT peerDeps) — bundled internally, invisible to consumer
- `openai`, `@anthropic-ai/sdk`, `@google/generative-ai` — lazy-loaded on first use
- `zod` — optional peer dep for `generateJSON` schema validation
