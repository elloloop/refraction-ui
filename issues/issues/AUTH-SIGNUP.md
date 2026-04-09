---
id: AUTH-SIGNUP
track: auth
depends_on: ["AUTH-PROVIDER", "COMP-BUTTON", "COMP-INPUT"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build SignUpForm component — email/password registration with display name, password requirements, and error handling.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/signup-form` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-signup-form` | React wrapper | React component with hooks binding |
| `@elloloop/angular-signup-form` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-signup-form` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Implementation |
|---------|------|----------------|
| **elloloop/stream-mind** | `frontend/src/features/circle/RegisterFlow.tsx` | Email, password (min 6), display name fields. Firebase error code translation to user-friendly messages. |
| **elloloop/learnloop** | `components/Auth.tsx` | `email-signup` view: name input, email input, password input (min 6 chars), "Create account" button, error display, "Already have account?" link. |

## Acceptance Criteria

- [ ] Display name input
- [ ] Email input with validation
- [ ] Password input with minimum length indicator (6 chars)
- [ ] Confirm password input (optional, configurable)
- [ ] "Create account" button with loading state
- [ ] "Already have an account? Sign in" link
- [ ] Firebase error code translation (email-already-in-use, weak-password, etc.)
- [ ] All inputs use refraction-ui primitives
- [ ] Uses `useAuth()` hook for sign-up logic
- [ ] ARIA: proper labels, password requirements announced
- [ ] Unit tests + Storybook stories
