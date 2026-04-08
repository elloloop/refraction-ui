import type { TTSProvider, TTSConfig, TTSAPI, TTSOptions } from './types.js'

/**
 * createTTS — creates a TTS manager that routes requests to registered providers.
 *
 * Resolution order: explicit opts.provider -> router -> default -> first available
 */
export function createTTS(config?: TTSConfig): TTSAPI {
  const providers = new Map<string, TTSProvider>()
  const providerOrder: string[] = []

  const defaultProvider = config?.default
  const router = config?.router

  function resolveProvider(opts?: TTSOptions): TTSProvider {
    // 1. Explicit opts.provider
    if (opts?.provider) {
      const p = providers.get(opts.provider)
      if (!p) {
        throw new Error(`TTS provider "${opts.provider}" not found. Registered providers: [${providerOrder.join(', ')}]`)
      }
      return p
    }

    // 2. Router
    if (router) {
      const chosen = router(opts ?? {}, {
        providers: [...providerOrder],
        default: defaultProvider ?? providerOrder[0] ?? '',
      })
      const p = providers.get(chosen)
      if (p) return p
    }

    // 3. Default
    if (defaultProvider) {
      const p = providers.get(defaultProvider)
      if (!p) {
        throw new Error(`Default TTS provider "${defaultProvider}" not registered. Registered providers: [${providerOrder.join(', ')}]`)
      }
      return p
    }

    // 4. First available
    if (providerOrder.length === 0) {
      throw new Error('No TTS providers configured. Call addProvider() to register at least one provider.')
    }

    return providers.get(providerOrder[0])!
  }

  const api: TTSAPI = {
    get providers() {
      return [...providerOrder]
    },

    speak(text: string, opts?: TTSOptions): void {
      const provider = resolveProvider(opts)
      provider.speak(text, opts)
    },

    stop(): void {
      for (const name of providerOrder) {
        const p = providers.get(name)
        if (p) p.stop()
      }
    },

    addProvider(name: string, provider: TTSProvider): void {
      if (providers.has(name)) {
        providers.set(name, provider)
      } else {
        providers.set(name, provider)
        providerOrder.push(name)
      }
    },
  }

  return api
}
