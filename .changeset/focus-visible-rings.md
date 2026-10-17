---
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

Show a keyboard focus ring on every ThreadView, Calendar and AppShell control without relying on a global `:focus-visible` rule in the host app. ThreadView reaction pills and the Reply action, Calendar days and month buttons, and the AppShell sidebar toggle now carry the shared `focus-visible` ring, and ThreadView reveals its hover-only actions while one of them has focus. The Astro calendar's client re-render now uses the core day styles, so its days keep the ring after a month change.
