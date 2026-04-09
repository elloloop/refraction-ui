---
id: AUTH-GUARD
track: auth
depends_on: ["AUTH-PROVIDER"]
size: M
labels: [feat]
status: pending
---

## Summary

Build AuthGuard and RoleGuard components — route protection with loading states, redirect, and role-based access control.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/auth-guard` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-auth-guard` | React wrapper | React component with hooks binding |
| `@elloloop/angular-auth-guard` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-auth-guard` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Implementation |
|---------|------|----------------|
| **elloloop/learnloop** | `app/(app)/layout.tsx` | Authenticated layout: checks Firebase auth state, fetches roles from Firestore, renders loading spinner while checking. Redirects to auth page if unauthenticated. |
| **elloloop/learnloop** | `lib/auth.ts` | `canAccessAdmin()`, `canAccessReviewer()`, `canAccessParent()`, `canAccessStudent()` — role-based access checks. `getAssignableRoles()` returns roles current user can grant. |
| **elloloop/learnloop** | `lib/get-default-portal.ts` | `getDefaultPortal(roles)` — returns URL for highest-privilege portal. |
| **elloloop/stream-mind** | `frontend/src/app/circle/join/page.tsx` | Auth-gated page: checks auth, shows sign-in prompt if unauthenticated, auto-joins if authenticated. |

## Acceptance Criteria

- [ ] `<AuthGuard>` wraps content that requires authentication
- [ ] Shows loading spinner while auth state resolves
- [ ] Redirects to login page (configurable) when unauthenticated
- [ ] `<RoleGuard roles={["admin", "reviewer"]}>` restricts by role
- [ ] Shows fallback (403 or redirect) when role check fails
- [ ] `fallback` prop for custom loading/unauthorized UI
- [ ] `redirectTo` prop for custom redirect path
- [ ] Composable: can nest AuthGuard > RoleGuard
- [ ] Works with Next.js App Router layouts
- [ ] `getDefaultPortal(roles)` utility for role-based routing
- [ ] Unit tests for all guard scenarios

## API

```tsx
<AuthGuard redirectTo="/login" fallback={<Spinner />}>
  <RoleGuard roles={["admin"]} fallback={<NotAuthorized />}>
    <AdminDashboard />
  </RoleGuard>
</AuthGuard>
```
