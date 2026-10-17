---
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

`FloatingReactions` now ships its own motion. The overlay renders the keyframes it animates with, so reactions rise and fade without any global CSS; before, they stayed still unless the app defined a `float-up` keyframe itself (that rule is no longer used and can be removed). Each reaction animates for exactly `REACTION_LIFETIME_MS`, the time `useFloatingReactions` removes it after. Under `prefers-reduced-motion: reduce` a reaction no longer moves: it stays where it appeared and fades out. In React 19 the stylesheet is hoisted into the document head once, however many overlays render. `ReactionBurst` stays a still preview of one reaction in its lane and never floats away.
