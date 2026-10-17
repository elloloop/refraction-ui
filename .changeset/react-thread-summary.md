---
'@refraction-ui/react': minor
---

Add `ThreadSummary` to `@refraction-ui/react`: the replies line under a message (stacked replier `avatars`, a `label` such as "12 replies" and a `detail` such as "Last reply 2 h ago") rendered as one button that calls `onTap` to open the thread, wraps on narrow rows, and takes its accessible name from `semanticLabel` or `label` + `detail`. (#569)
