---
id: FORM-FEEDBACK-DIALOG
track: forms
depends_on: ["COMP-DIALOG", "COMP-INPUT", "COMP-TEXTAREA"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build FeedbackDialog — modal for submitting user feedback with comment, optional email, honeypot bot protection, and captcha integration.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/feedback-dialog` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-feedback-dialog` | React wrapper | React component with hooks binding |
| `@elloloop/angular-feedback-dialog` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-feedback-dialog` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/featuredocs** | `src/components/FeedbackDialog.tsx` | Modal with textarea (comment), email input (optional), honeypot hidden field, Cloudflare Turnstile captcha. Success checkmark animation. Types: "text", "video", "general". |
| **elloloop/featuredocs** | `src/components/FeedbackButton.tsx` | Small bordered button ("Report outdated") with flag icon. Opens FeedbackDialog. |
| **elloloop/featuredocs** | `src/components/TextSelectionFeedback.tsx` | Listens for text selection (3+ chars), shows floating popover ("Mark as outdated"). Opens FeedbackDialog with selected text. |

## Acceptance Criteria

- [ ] Modal dialog with textarea for comment
- [ ] Optional email input
- [ ] Honeypot hidden field for bot protection
- [ ] Captcha slot (Turnstile, reCAPTCHA, or custom)
- [ ] Feedback types: text, video, general (or custom)
- [ ] Success animation (checkmark) on submit
- [ ] `onSubmit(feedback)` callback
- [ ] `<FeedbackButton>` — small trigger button with icon
- [ ] `<TextSelectionFeedback>` — floating popover on text selection
- [ ] Loading state on submit button
- [ ] ARIA: proper dialog labeling, focus management
- [ ] Unit tests + Storybook stories
