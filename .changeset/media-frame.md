---
'@refraction-ui/react': minor
'@refraction-ui/astro': minor
---

Add `MediaFrame`: a fixed-aspect box for an image, a video or a live preview on a letterbox surface, with an optional corner caption. `ratio` takes a number, `"w:h"` or `"w/h"` and falls back to a square (with a development warning) when it is unusable; the frame exposes `data-orientation`. `labelPosition` corners are logical, so they follow the writing direction, and `tone` switches the letterbox between the neutral surface and the theme's tertiary accent.
