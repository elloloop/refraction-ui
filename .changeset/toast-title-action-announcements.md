---
"@refraction-ui/react": minor
"@refraction-ui/astro": patch
---

Toasts can carry a title and an action such as Undo: `toast(message, { title, action: { label, onClick } })`. Choosing the action closes the toast, then runs the callback once. `toast(message)` and `toast(message, { variant, duration })` work as before.

The React `Toaster` is now a labelled landmark region (`aria-label`, default "Notifications") with a polite and an assertive live region that exist before any toast, so each new toast is announced once: errors assertively, other variants politely. Toasts inside a `Toaster` are no longer `role="alert"` themselves, so no toast is announced twice; a standalone `Toast` still is. Select rendered toasts with `[data-rfr-toast]`.

The auto-dismiss countdown now really pauses while a toast is hovered or holds focus, and resumes with the time it had left (the manager gains `pause(id)` and `resume(id)`). Escape closes the focused toast, and focus returns to where it was before it entered the toasts. The action and dismiss buttons get a keyboard-only focus ring, the dismiss button's name can be set with `dismissLabel`, and toast transitions are off for users who prefer reduced motion (in Astro too).
