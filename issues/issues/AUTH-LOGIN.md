---
id: AUTH-LOGIN
track: auth
depends_on: ["AUTH-PROVIDER", "COMP-BUTTON", "COMP-INPUT"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build LoginForm component — email/password sign-in with Google OAuth option, error handling, and forgot-password link.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/login-form` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-login-form` | React wrapper | React component with hooks binding |
| `@elloloop/angular-login-form` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-login-form` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Implementation |
|---------|------|----------------|
| **elloloop/stream-mind** | `frontend/src/features/circle/RecoverFlow.tsx` | Email + password inputs, "Forgot password?" triggers reset email via Firebase. Three sub-views: sign-in, reset form, reset confirmation. Firebase error code translation. |
| **elloloop/learnloop** | `components/Auth.tsx` | Multi-view component with `email-signin` view: email input, password input, "Forgot password?" link, "Sign in" button, error display, "Create account" link. |
| **elloloop/easyloops** | `src/features/auth/components/AuthButton.tsx` | Google sign-in button with loading state, Google logo SVG. |

## Acceptance Criteria

- [ ] Email input with validation (includes `@`)
- [ ] Password input with show/hide toggle
- [ ] "Sign in" button with loading state
- [ ] Google OAuth button with Google logo
- [ ] "Forgot password?" link (navigates to forgot-password or inline toggle)
- [ ] "Create account" link (navigates to sign-up)
- [ ] Firebase error code translation to user-friendly messages
- [ ] All inputs use refraction-ui Input component
- [ ] Button uses refraction-ui Button component
- [ ] Keyboard: Enter submits form, Tab navigates fields
- [ ] ARIA: proper labels, error announcements via aria-live
- [ ] Responsive layout (card on desktop, full-width on mobile)
- [ ] Uses `useAuth()` hook for sign-in logic
- [ ] Unit tests + Storybook stories
