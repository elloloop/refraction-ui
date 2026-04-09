---
id: AUTH-FORGOT-PASSWORD
track: auth
depends_on: ["AUTH-PROVIDER", "COMP-BUTTON", "COMP-INPUT"]
size: S
labels: [feat, a11y]
status: pending
---

## Summary

Build ForgotPasswordForm component — email-based password reset flow with confirmation state.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/forgot-password` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-forgot-password` | React wrapper | React component with hooks binding |
| `@elloloop/angular-forgot-password` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-forgot-password` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Implementation |
|---------|------|----------------|
| **elloloop/stream-mind** | `frontend/src/features/circle/RecoverFlow.tsx` | "Forgot password?" triggers `resetPassword(email)` via Firebase. Three sub-views: sign-in, reset form, reset confirmation ("Check your email"). |
| **elloloop/learnloop** | `components/Auth.tsx` | `forgot-password` view: email input, "Send reset link" button, success message, "Back to sign in" link. |

## Acceptance Criteria

- [ ] Email input with validation
- [ ] "Send reset link" button with loading state
- [ ] Success state: "Check your email" confirmation message
- [ ] "Back to sign in" link
- [ ] Error handling (user-not-found, invalid-email)
- [ ] Uses `useAuth().resetPassword()` from AuthProvider
- [ ] ARIA: proper labels, status announcements via aria-live
- [ ] Unit tests + Storybook stories
