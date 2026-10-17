---
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

Toasts no longer let the page show through or spill off small screens.

- The tinted variants (success, error, warning) paint their tint over an opaque background, so content behind a toast no longer shows through.
- The toaster keeps a 16px gutter on both sides. On a phone it spans the screen minus the gutters instead of overflowing the left edge; on wider screens it stays at the bottom right, capped at `max-w-sm`.
- A long unbroken message, such as a URL, wraps instead of pushing the dismiss button out of the toast.
- The React `Toaster` and `Toast` carry the `data-rfr-toaster` and `data-rfr-toast` hooks the Astro ones already had.
- The Astro programmatic toast uses the shared variant classes instead of its own copy, and an unknown variant falls back to `default`.
