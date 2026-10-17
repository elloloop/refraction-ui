---
"@refraction-ui/astro": minor
---

The Astro toasts catch up with the React ones: a title, an action, live-region announcements and a keyboard focus ring.

- `Toast.astro` takes `title` (a heading above the message), `actionLabel` (an action button such as Undo) and `dismissLabel` (the dismiss button's accessible name). Choosing the action closes the toast, then dispatches a bubbling `rfr-toast-action` event from it. The `title` prop is now this heading; it is no longer passed through as the HTML `title` attribute.
- `window.__rfr_toast({ message, title, variant, duration, action: { label, onClick } })` shows the same toast from a script; the callback runs once, after the toast starts to close. A bare `window.__rfr_toast('Saved')` works as before.
- `Toaster.astro` is a labelled landmark region (`aria-label`, default "Notifications") with a polite and an assertive live region that exist before any toast. Each toast in it is announced once, errors assertively and the rest politely, and loses its own `role="alert"` so it is not announced twice. A toast outside a toaster keeps `role="alert"`. `dismissLabel` on the toaster names the dismiss button of scripted toasts.
- The countdown pauses while a toast is hovered or holds focus. Escape closes the focused toast, and focus returns to where it was before it entered the toaster. The action and dismiss buttons get the keyboard-only focus ring, the dismiss glyph is hidden from assistive technology, and toasts close without the exit animation for users who prefer reduced motion.
