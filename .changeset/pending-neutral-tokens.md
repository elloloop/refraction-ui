---
"@refraction-ui/tailwind-config": patch
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

Add `pending` (orange) and `neutral` (gray) status tokens end-to-end (vars in all themes + light/dark, preset utilities), and route status-indicator pending/neutral, presence-indicator offline, and avatar-group offline through them (offline now shares the neutral token). Completes the status token set — no status colors remain hardcoded.
