import type { AIProvider, AIConfig, AIAPI, GenerateOptions } from './types.js'

/**
 * createAI — creates an AI manager that routes requests to registered providers.
 *
 * Resolution order: explicit opts.provider -> router -> default -> first available
 * Fallback: on error, try next in fallback chain
 */
export function createAI(config?: AIConfig): AIAPI {
  const providers = new Map<string, AIProvider>()
  /** Insertion-ordered list of provider names */
  const providerOrder: string[] = []

  const defaultProvider = config?.default
  const fallbackChain = config?.fallback ?? []
  const router = config?.router

  function resolveProvider(opts?: GenerateOptions): AIProvider {
    // 1. Explicit opts.provider
    if (opts?.provider) {
      const p = providers.get(opts.provider)
      if (!p) {
        throw new Error(`AI provider "${opts.provider}" not found. Registered providers: [${providerOrder.join(', ')}]`)
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
        throw new Error(`Default AI provider "${defaultProvider}" not registered. Registered providers: [${providerOrder.join(', ')}]`)
      }
      return p
    }

    // 4. First available
    if (providerOrder.length === 0) {
      throw new Error('No AI providers configured. Call addProvider() to register at least one provider.')
    }

    return providers.get(providerOrder[0])!
  }

  async function withFallback<T>(
    primary: AIProvider,
    fn: (provider: AIProvider) => Promise<T>,
  ): Promise<T> {
    try {
      return await fn(primary)
    } catch (error) {
      // Try fallback chain
      for (const name of fallbackChain) {
        const fallback = providers.get(name)
        if (!fallback || fallback === primary) continue
        try {
          return await fn(fallback)
        } catch {
          // continue to next fallback
        }
      }
      // All fallbacks exhausted or no fallbacks — throw
      // If there were fallbacks, throw the last error from the chain
      if (fallbackChain.length > 0) {
        // Try the last fallback one more time to get its error
        const lastFallbackName = fallbackChain[fallbackChain.length - 1]
        const lastFallback = providers.get(lastFallbackName)
        if (lastFallback && lastFallback !== primary) {
          return await fn(lastFallback)
        }
      }
      throw error
    }
  }

  const api: AIAPI = {
    get providers() {
      return [...providerOrder]
    },

    async generateText(prompt: string, opts?: GenerateOptions): Promise<string> {
      const provider = resolveProvider(opts)
      return withFallback(provider, (p) => p.generateText(prompt, opts))
    },

    async generateJSON<T = unknown>(prompt: string, opts?: GenerateOptions): Promise<T> {
      const provider = resolveProvider(opts)
      return withFallback(provider, (p) => p.generateJSON<T>(prompt, opts))
    },

    addProvider(name: string, provider: AIProvider): void {
      if (providers.has(name)) {
        // Replace, keep same position
        providers.set(name, provider)
      } else {
        providers.set(name, provider)
        providerOrder.push(name)
      }
    },

    removeProvider(name: string): void {
      if (providers.has(name)) {
        providers.delete(name)
        const idx = providerOrder.indexOf(name)
        if (idx !== -1) providerOrder.splice(idx, 1)
      }
    },
  }

  return api
}
