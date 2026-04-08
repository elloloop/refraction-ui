---
id: AUTH-PROVIDER
track: auth
depends_on: ["PKG-CORE", "PKG-SHARED"]
size: L
labels: [feat]
status: pending
---

## Summary

Build `@refraction-ui/auth` (headless core) — auth state machine, internal adapter resolution, RBAC utilities. The auth provider (Firebase, Supabase, etc.) is an internal implementation detail — the consumer never knows or cares which one is used.

Also build `@refraction-ui/react-auth`, `@refraction-ui/angular-auth`, and `@refraction-ui/astro-auth` wrappers.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/auth` | Headless core | Auth state machine, internal adapters (Firebase/Supabase/etc.), RBAC utilities, auto-detection |
| `@refraction-ui/react-auth` | React wrapper | `<AuthProvider>`, `useAuth()` hook |
| `@refraction-ui/angular-auth` | Angular wrapper | `RfrAuthProvider` service, `rfrAuth` signal |
| `@refraction-ui/astro-auth` | Astro wrapper | Server-side auth check, client island for interactive auth |

### Dependency Encapsulation

**The consumer NEVER knows about Firebase, Supabase, or any auth provider.** The auth package bundles all adapters internally and auto-detects which to use from config or environment variables.

```tsx
// Consumer code — this is ALL they write. No Firebase. No Supabase. Nothing.
import { AuthProvider, useAuth } from '@refraction-ui/react-auth'

export default function App() {
  return (
    <AuthProvider>
      <MyApp />
    </AuthProvider>
  )
}

function MyApp() {
  const { user, isAuthenticated, signIn, signOut } = useAuth()
  // ...
}
```

**Provider selection is config/env — never code:**
```bash
# If these env vars exist, auth auto-detects Firebase
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...

# Or if these exist instead, auto-detects Supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Or explicit in .refractionrc
# { "auth": { "provider": "firebase" } }
```

**We can switch providers internally with zero consumer impact.** Change the env vars in deployment, update the package if needed — no app code changes.

See **ADR 0003** for full rationale.

## Source References

| Project | File | What it provides |
|---------|------|-----------------|
| **elloloop/stream-mind** | `frontend/src/lib/auth.tsx` | `AuthProvider` + `useAuth` hook: user state, isLoading, isAuthenticated, signUp (email/password/displayName), signIn, signOut, resetPassword, getIdToken. Module-level cached token refreshed every 50 min. E2E test mode via `__E2E_AUTH_USER__`. |
| **elloloop/stream-mind** | `frontend/src/lib/firebase.ts` | Firebase app initialization from env vars. Exports nullable `auth`. |
| **elloloop/stream-mind** | `frontend/src/lib/circle-storage.ts` | `isRegistered()`, `getAuthToken()`, `clearCircleData()`. |
| **elloloop/easyloops** | `src/features/auth/hooks/useAuth.ts` | Hook: `{ user, loading, isAuthorizedForGo, login, logout }`. Firebase `onAuthStateChanged`. Tauri mode skips auth. `login` uses Google popup. |
| **elloloop/easyloops** | `src/shared/lib/firebase.ts` | `signInWithGoogle()`, `signOutUser()`, `onAuthStateChange()`, `getUserIdToken()`. |
| **elloloop/learnloop** | `components/Auth.tsx` | Multi-view auth UI (Google + email sign-in/up/forgot-password). |
| **elloloop/learnloop** | `lib/auth.ts` | RBAC utilities: `hasRole()`, `hasAnyRole()`, `canAccessAdmin/Reviewer/Parent/Student()`, `canDeleteUser()`, `canModifyUserRoles()`, `getAssignableRoles()`, `addRole()`, `removeRole()`. |
| **elloloop/learnloop** | `lib/auth-server.ts` | Server-side Firebase Admin SDK, token verification. |
| **elloloop/learnloop** | `lib/clear-auth.ts` | Complete auth state clearing (sign out + storage + redirect). |

## Acceptance Criteria

- [ ] `<AuthProvider>` wraps app — zero config required, reads env vars
- [ ] `useAuth()` returns `{ user, isLoading, isAuthenticated, signIn, signUp, signOut, resetPassword, getIdToken }`
- [ ] Auto-detects provider from env vars (Firebase, Supabase) or `.refractionrc`
- [ ] Email/password sign-in and sign-up with display name
- [ ] Google OAuth popup sign-in
- [ ] Password reset via email
- [ ] Token caching with automatic refresh (configurable interval, default 50 min)
- [ ] `onAuthStateChanged` subscription with proper cleanup
- [ ] RBAC utilities: `hasRole()`, `hasAnyRole()`, `canAccess*()`, `addRole()`, `removeRole()`
- [ ] `clearAuth()` — complete sign-out + storage cleanup + redirect
- [ ] E2E test mode support (mock user injection)
- [ ] Tauri/desktop mode support (skip auth)
- [ ] Server-side token verification utility
- [ ] Graceful degradation when no auth config present (auth disabled, no crash)
- [ ] TypeScript strict types for User, AuthContext, UserRole
- [ ] Unit tests for RBAC logic, token caching, state transitions, adapter resolution
- [ ] Provider SDKs are `dependencies` (NOT peerDeps), bundled internally

## Internal Package Structure

```
packages/auth/
  src/
    types.ts              # User, AuthState, AuthAdapter (internal interface)
    state-machine.ts      # Auth state management (pure TS)
    rbac.ts               # hasRole, hasAnyRole, canAccess (pure functions)
    adapters/
      firebase.ts         # Firebase adapter (bundles firebase SDK)
      supabase.ts         # Supabase adapter (bundles @supabase/supabase-js)
      mock.ts             # Mock adapter for E2E testing
      resolve.ts          # Auto-detect provider from config/env
    config.ts             # Read .refractionrc and env vars
    index.ts              # Public API (NO adapter exports — only types + createAuth)
```

## Public API

```typescript
// @refraction-ui/auth — headless core
// Consumer sees ONLY these. No Firebase. No Supabase. No adapters.
export type { User, AuthState, UserRole }
export function createAuth(config?: { provider?: string }): AuthMachine
export function hasRole(user: User, role: string): boolean
export function hasAnyRole(user: User, roles: string[]): boolean
export function canAccess(user: User, resource: string): boolean
```

```tsx
// @refraction-ui/react-auth — React wrapper
export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element
export function useAuth(): AuthAPI
export function AuthGuard({ children, roles?, fallback?, redirectTo? }): JSX.Element
```

## Notes

- Adapters are INTERNAL modules — not separate npm packages
- `resolve.ts` handles auto-detection: check config, then env vars, then fallback to disabled
- Firebase SDK, Supabase SDK, etc. are `dependencies` of `@refraction-ui/auth` — bundled via tsup
- Tree-shaking: only the resolved adapter's code is included in the consumer's bundle
- Future providers (Auth0, Clerk) are added as new internal adapter files — no new packages needed
