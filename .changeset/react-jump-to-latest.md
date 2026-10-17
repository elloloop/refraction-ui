---
'@refraction-ui/react': minor
---

Add `JumpToLatest` and `useJumpToLatest` to `@refraction-ui/react`: a pill that returns a scrolled-back reader to the newest item. The hook tracks "at end" for a plain scroller (`scrollRef`) or a VirtualList (`listRef`) and counts items that arrived while away (`keys` or `count`); the pill shows "3 new messages" (overridable with `formatNewCount`) or "Jump to latest", jumps smoothly (instantly under reduced motion) to the end or, with `jumpTo="first-unread"`, to the first missed item, and politely announces arrivals. (#568)
