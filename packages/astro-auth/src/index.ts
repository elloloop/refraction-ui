export { default as AuthGuard } from './AuthGuard.astro'

// Re-export core types for convenience
export type { User, AuthState, AuthConfig } from '@refraction-ui/auth'
export { createAuth } from '@refraction-ui/auth'
