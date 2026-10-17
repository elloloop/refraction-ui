---
'@refraction-ui/react': minor
---

Add `VirtualList` to `@refraction-ui/react`: a zero-dependency virtualised list for long, variable-height histories (#574). It measures rows with a ResizeObserver, opens at the bottom and sticks there with `anchor="end"`, prepends older rows without the view jumping, keeps the focused row mounted, and exposes `scrollToIndex` / `scrollToKey` / `scrollToEnd` through its ref plus `onAtEndChange` and the shared `isVirtualListAtEnd` helper.
