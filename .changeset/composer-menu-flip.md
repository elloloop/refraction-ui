---
'@refraction-ui/react': patch
---

Composer: the suggestion menu (`@` mentions, `/` commands, `:emoji:`) now opens on whichever side of the composer has more viewport space — previously it always opened above, which could render it off-screen when the composer sat near the top of the viewport. The menu also caps its height to the available space and scrolls.
