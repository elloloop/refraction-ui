# ADR 0003: Dependency Encapsulation — Internal Dependencies Are Invisible to Consumers

## Status

Accepted

## Context

Refraction-ui components depend on various libraries internally:
- **Auth**: Firebase (today), but could switch to Supabase, Auth0, Clerk, or custom
- **Headless primitives**: @base-ui/react, Radix (today), could switch to Ark UI, Zag.js
- **Icons**: lucide-react (today), could switch to any icon set
- **Command palette**: cmdk (today), could switch to another
- **Class merging**: clsx + tailwind-merge (today)
- **Date math**: date-fns (today)
- **Markdown**: marked (today)
- **Video export**: @ffmpeg/ffmpeg (today)
- **AI**: Gemini/OpenAI/Anthropic SDKs (today)

Consumers should never know what auth provider, AI SDK, or internal library we use. These are implementation details that we own and can change at any time.

## Decision

**All internal dependencies are completely invisible.** Consumers never see, install, configure, or even know about them.

### Rules

1. **No peer dependencies for implementation details.** Firebase, cmdk, date-fns, marked, etc. are `dependencies` (not `peerDependencies`). They are bundled or resolved internally.

2. **Peer dependencies only for the consumer's framework.** The only peer deps a consumer ever sees:
   - `react` + `react-dom` (for `@refraction-ui/react-*`)
   - `@angular/core` (for `@refraction-ui/angular-*`)
   - `astro` (for `@refraction-ui/astro-*`)
   - `tailwindcss` (for `@refraction-ui/tailwind-config` — because it's a Tailwind preset)

3. **Configuration-driven provider selection.** For services with swappable backends (auth, AI, TTS), the provider is selected via configuration — NOT via separate adapter package imports. The consumer never imports Firebase, Supabase, or any provider SDK.

   **Consumer code:**
   ```tsx
   // This is ALL the consumer writes. No Firebase. No Supabase. Nothing.
   import { AuthProvider } from '@refraction-ui/react-auth'

   <AuthProvider>
     <App />
   </AuthProvider>
   ```

   **Provider selection happens in config** (`.refractionrc`, `refraction.config.ts`, or env vars):
   ```jsonc
   // .refractionrc
   {
     "auth": {
       "provider": "firebase"    // or "supabase", "auth0", "clerk"
       // credentials read from env vars automatically:
       // REFRACTION_AUTH_API_KEY, REFRACTION_AUTH_PROJECT_ID, etc.
       // OR provider-specific env vars:
       // FIREBASE_API_KEY, SUPABASE_URL, etc.
     },
     "ai": {
       "provider": "openai"      // or "anthropic", "gemini"
     }
   }
   ```

   **Or purely via environment variables** (zero config):
   ```bash
   # If these exist, auth auto-configures Firebase
   FIREBASE_API_KEY=...
   FIREBASE_AUTH_DOMAIN=...
   FIREBASE_PROJECT_ID=...

   # If these exist instead, auth auto-configures Supabase
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

   **Auto-detection order:**
   1. Explicit `provider` in `.refractionrc` → use that
   2. `REFRACTION_AUTH_PROVIDER=firebase` env var → use that
   3. Firebase env vars present → auto-detect Firebase
   4. Supabase env vars present → auto-detect Supabase
   5. No config → auth features disabled gracefully (no crash)

4. **Internal adapter pattern.** Internally, refraction-ui still uses adapters — but these are internal implementation details, not consumer-facing packages:

   ```
   @refraction-ui/auth (headless core)
     └── src/
         ├── types.ts           # AuthAdapter interface (internal)
         ├── state-machine.ts   # Auth state management
         ├── adapters/
         │   ├── firebase.ts    # Firebase adapter (internal)
         │   ├── supabase.ts    # Supabase adapter (internal)
         │   └── resolve.ts     # Auto-detect which adapter to use from config/env
         └── index.ts           # Public API: just types + createAuth()
   ```

   The adapters are internal modules within the same package, not separate npm packages. The `resolve.ts` module reads config/env and returns the right adapter.

5. **Bundle internal deps.** Headless core packages bundle their dependencies (via tsup `noExternal`) so the consumer's node_modules stays clean. Framework wrappers are thin and don't need bundling.

6. **Re-export types, not modules.** If a consumer needs a type (e.g., `User`), it's a refraction-ui type. Never expose internal types from Firebase, Supabase, etc.

7. **Future: external user provider choice.** When refraction-ui is used by external open-source users, they can choose their provider via the same config mechanism. No code changes — just set the config or env vars. We may later add a CLI command: `refraction auth setup` that asks which provider and writes the config.

## Consumer Experience

### Internal teams (elloloop projects)
```bash
# Install
pnpm add @refraction-ui/react-auth

# Set env vars (already have these from Firebase projects)
# FIREBASE_API_KEY=... (existing env vars just work)

# Use
import { AuthProvider, useAuth } from '@refraction-ui/react-auth'
```

The consumer never sees Firebase. If we switch to Supabase internally, we update the `@refraction-ui/auth` package, change the env vars in deployment, and zero consumer code changes.

### External users (future)
```bash
# Install
pnpm add @refraction-ui/react-auth

# Configure (pick your provider)
# Option A: env vars
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_ANON_KEY=...

# Option B: config file
echo '{ "auth": { "provider": "supabase" } }' > .refractionrc

# Use — identical code regardless of provider
import { AuthProvider, useAuth } from '@refraction-ui/react-auth'
```

## Consequences

**Positive:**
- Consumers install `@refraction-ui/react-auth` and it just works
- Provider selection is config/env, not code — no imports to change
- We can swap Firebase → Supabase with zero consumer impact
- External users get provider choice without code complexity
- No version conflict hell
- Fewer packages to publish (no separate auth-firebase, auth-supabase packages)

**Negative:**
- Auth package bundles ALL supported adapters (increases package size)
- Adding a new provider requires a release of the auth package

**Mitigations:**
- Tree-shaking: only the selected adapter's code is included in the consumer's bundle (dynamic import or build-time elimination)
- Adapter code is thin (< 200 lines each), so even bundling all is small
- Use `import()` for non-default adapters to avoid loading unused provider SDKs

## Single-Provider vs Multi-Provider Services

Not all services are one-provider-at-a-time. Some services naturally use **multiple providers simultaneously**:

- **AI/LLM**: Use Anthropic for complex reasoning, OpenAI for fast responses, Gemini for vision — in the same app, at the same time. Fallback chains: try cheapest first, escalate on failure.
- **TTS**: Use ElevenLabs for English, Google for Hindi, browser Speech API as fallback — voice routing by language.
- **Analytics**: Send the same events to PostHog AND Mixpanel simultaneously.

Other services are naturally **single-provider**:

- **Auth**: You sign in with one provider. Can't be "half Firebase, half Supabase."
- **Storage**: Files live in one place.

### Configuration Patterns

#### Single-provider (`provider` — singular)

```jsonc
// .refractionrc
{
  "auth": {
    "provider": "firebase"        // ONE provider, auto-detected from env if omitted
  },
  "storage": {
    "provider": "s3"
  }
}
```

#### Multi-provider (`providers` — plural, with routing)

```jsonc
// .refractionrc
{
  "ai": {
    "providers": {
      // Each provider auto-configures from its own env vars
      // OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY
      "openai": {},
      "anthropic": {},
      "gemini": {}
    },
    "routing": {
      "default": "openai",               // simple calls go here
      "fallback": ["openai", "anthropic", "gemini"],  // try in order on failure
      "intents": {
        "fast": "openai",                // ai.generate({ intent: 'fast' })
        "reasoning": "anthropic",        // ai.generate({ intent: 'reasoning' })
        "vision": "gemini"               // ai.generate({ intent: 'vision' })
      }
    }
  },
  "tts": {
    "providers": {
      "browser": {},                     // always available, zero config
      "elevenlabs": {},                  // from ELEVENLABS_API_KEY
      "google": {}                       // from GOOGLE_TTS_API_KEY
    },
    "routing": {
      "default": "browser",
      "fallback": ["browser"],           // always fall back to browser
      "languages": {
        "en": "elevenlabs",              // English → ElevenLabs
        "hi": "google",                  // Hindi → Google
        "te": "google"                   // Telugu → Google
      }
    }
  },
  "analytics": {
    "providers": {
      "posthog": {},                     // from POSTHOG_API_KEY
      "mixpanel": {}                     // from MIXPANEL_TOKEN
    },
    "mode": "broadcast"                  // send to ALL providers simultaneously
  }
}
```

### Consumer API for Multi-Provider

Multi-provider services give the consumer three levels of control:

#### Level 1: Just works (default routing)
```typescript
import { createAI } from '@refraction-ui/ai'

const ai = createAI()
await ai.generateText('Summarize this')  // goes to default provider
```

#### Level 2: Explicit provider by name
```typescript
// Call a specific provider when your business logic knows what it wants
await ai.generateText('Analyze this deeply', { provider: 'anthropic' })
await ai.generateText('Quick answer', { provider: 'openai', model: 'gpt-4o-mini' })
await ai.generateText('Describe image', { provider: 'gemini', image: buf })

// See what's available
console.log(ai.providers)  // ['openai', 'anthropic', 'gemini']
```

#### Level 3: Custom router (app's business logic decides)
```typescript
const ai = createAI({
  router: (request, ctx) => {
    // App-specific logic — route based on ANYTHING
    if (request.image) return 'gemini'
    if (request.estimatedTokens > 50000) return 'anthropic'
    if (request.surfaceArea === 'chat') return 'anthropic'
    if (request.surfaceArea === 'code') return 'openai'
    if (request.user?.tier === 'free') return 'openai'
    return ctx.default
  }
})

// Pass any context your router needs — it flows through
await ai.generateText('Help me refactor', { surfaceArea: 'code', user: currentUser })
```

#### TTS — same three levels
```typescript
const tts = createTTS()

// Level 1: default
await tts.speak('Hello')

// Level 2: explicit
await tts.speak('Hello', { provider: 'elevenlabs', voice: 'rachel' })
await tts.speak('నమస్కారం', { provider: 'google', language: 'te' })

// Level 3: custom router
const tts = createTTS({
  router: (req) => {
    if (req.language === 'en' && req.quality === 'high') return 'elevenlabs'
    if (['hi', 'te', 'ta'].includes(req.language)) return 'google'
    return 'browser'
  }
})
```

#### Analytics — broadcast (sends to ALL)
```typescript
import { createAnalytics } from '@refraction-ui/analytics'
const analytics = createAnalytics()
analytics.track('signup_completed', { plan: 'pro' })  // → PostHog AND Mixpanel
```

### Internal Resolution Logic

```
Single-provider (auth, storage):
  config.provider → resolve ONE adapter → done

Multi-provider with routing (ai, tts):
  1. Init ALL adapters from env vars (lazy — loaded on first use)
  2. On each call:
     a. Explicit { provider: 'name' } → use that directly
     b. Custom router function → call it, use what it returns
     c. Config routing rules → match intent/language/etc.
     d. Default provider → fallback
  3. On failure → check fallback chain → try next adapter

Multi-provider broadcast (analytics):
  config.providers → init ALL adapters
  on each call → fan-out to ALL adapters simultaneously
```

## Services Summary

| Service | Mode | Config Key | Default | Supported |
|---------|------|-----------|---------|-----------|
| Auth | **single** | `auth.provider` | firebase | firebase, supabase, auth0, clerk |
| Storage | **single** | `storage.provider` | (none) | s3, gcs, cloudflare-r2 |
| AI/LLM | **multi** (routed) | `ai.providers` | openai | openai, anthropic, gemini |
| TTS | **multi** (routed) | `tts.providers` | browser | browser, elevenlabs, openai, google |
| Analytics | **multi** (broadcast) | `analytics.providers` | (none) | posthog, mixpanel, amplitude |
