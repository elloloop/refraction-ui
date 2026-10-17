---
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

FloatingReactions and ReactionBurst now ship the keyframes they animate with, so reactions float up and fade without any global CSS. Before, the animation referred to a `float-up` keyframe the library never defined, so in apps that had not added one themselves, reactions sat still until they were removed.

When the reader prefers reduced motion (`prefers-reduced-motion: reduce`), reactions now stay where they appear and fade out over the same 3 s instead of rising.

A reaction rises 80% of the overlay's height, as the Flutter component does. The keyframe the docs used to suggest moved it 80% of the emoji's own height (about 24px). The shipped keyframes carry a library prefix, so an app's own `float-up` rule is no longer used and can be removed. The React adapter renders them once per page under React 19 (React 18 renders them alongside each overlay or burst); the Astro adapter renders them with each overlay.
