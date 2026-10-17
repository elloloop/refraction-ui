---
'@refraction-ui/react': minor
---

Add `FloatingPanel` to `@refraction-ui/react`: a non-modal, named-region mini panel (e.g. a call preview) that is dragged by a "Move panel" handle and snaps to the nearest viewport corner, moves corner-to-corner with the arrow keys, stays inside the viewport on resize and collapses to its header. Position (`corner` / `defaultCorner` / `onCornerChange`) and `collapsed` are controllable; the snap is instant under reduced motion. (#589)
