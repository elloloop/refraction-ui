---
"@refraction-ui/react": patch
---

DataTable `getRowProps` and StatGrid item `props` accept `data-*` attributes without a cast (new shared `DataAttributes` type). An object of only data attributes previously failed TypeScript's weak-type check against `HTMLAttributes`.
