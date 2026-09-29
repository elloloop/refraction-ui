---
"@refraction-ui/react": patch
---

Use hydration-stable React IDs for Tabs and DropdownMenu so server request history cannot break their ARIA relationships on the client.

Respect avatar images that finished loading or failed before hydration, so cached failures show initials and cached successes hide the fallback.
