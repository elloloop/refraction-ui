import type { AuthAdapter, AuthProviderType } from '../types.js'
import { createMockAdapter } from './mock.js'

/**
 * Resolve the auth adapter based on config or environment variables.
 * Provider SDKs (Firebase, Supabase) are loaded dynamically to avoid
 * bundling all providers — only the selected one is loaded.
 *
 * Detection order:
 * 1. Explicit provider in config
 * 2. REFRACTION_AUTH_PROVIDER env var
 * 3. Firebase env vars present → firebase
 * 4. Supabase env vars present → supabase
 * 5. No config → mock adapter (no crash)
 */
export function resolveAdapter(provider?: AuthProviderType): AuthAdapter {
  const resolved = provider ?? detectProvider()

  switch (resolved) {
    case 'firebase':
      // TODO: implement firebase adapter (bundles firebase SDK internally)
      // For now, fall through to mock with a console warning
      if (typeof console !== 'undefined') {
        console.warn('[refraction-ui/auth] Firebase adapter not yet implemented. Using mock adapter.')
      }
      return createMockAdapter()

    case 'supabase':
      // TODO: implement supabase adapter (bundles @supabase/supabase-js internally)
      if (typeof console !== 'undefined') {
        console.warn('[refraction-ui/auth] Supabase adapter not yet implemented. Using mock adapter.')
      }
      return createMockAdapter()

    case 'mock':
      return createMockAdapter()

    case 'none':
    default:
      return createMockAdapter()
  }
}

function detectProvider(): AuthProviderType {
  // Check env vars (works in Node.js, Next.js, etc.)
  const env = typeof process !== 'undefined' ? process.env : {} as Record<string, string | undefined>

  const explicit = env['REFRACTION_AUTH_PROVIDER'] as AuthProviderType | undefined
  if (explicit) return explicit

  // Firebase detection
  if (env['FIREBASE_API_KEY'] || env['NEXT_PUBLIC_FIREBASE_API_KEY']) {
    return 'firebase'
  }

  // Supabase detection
  if (env['SUPABASE_URL'] || env['NEXT_PUBLIC_SUPABASE_URL']) {
    return 'supabase'
  }

  return 'none'
}
