---
id: AI-ADAPTERS
track: ai
depends_on: ["PKG-AI"]
size: M
labels: [feat]
status: superseded
---

## Summary

~~Create separate adapter packages for AI providers.~~

**SUPERSEDED** — AI provider adapters are now **internal modules** within `@refraction-ui/ai`, not separate packages. See PKG-AI for details.

The consumer never imports OpenAI, Anthropic, or Gemini SDKs. Provider selection happens via env vars or `.refractionrc` config:

```bash
# Auto-detects from env vars
OPENAI_API_KEY=...        # → uses OpenAI
ANTHROPIC_API_KEY=...     # → uses Anthropic
GOOGLE_AI_API_KEY=...     # → uses Gemini

# Or explicit in config
# { "ai": { "provider": "anthropic" } }
```

```typescript
// Consumer code — provider is invisible
import { createAI } from '@refraction-ui/ai'

const ai = createAI()  // auto-detects from env/config
const result = await ai.generateText('Explain quantum computing')
```

See **ADR 0003** for the full rationale.
