---
'@refraction-ui/react': minor
---

Add `CollapsibleRail`, `RailEdgeToggle`, `RailBackdrop` and `useCollapsibleRail`: a side navigation rail with a full and a collapsed width that becomes an off-canvas overlay below 768px. The hook remembers the wide-viewport width under an optional `storageKey` (narrow-viewport use never overwrites it, and unusable storage warns once in development), server-renders a closed overlay so a phone never paints it before hydration, makes a closed overlay inert, moves focus into the overlay when it opens and back to the opener when it closes, and closes it on Escape. A click on the rail's empty space flips the width; clicks on its links, controls or portals do not.
