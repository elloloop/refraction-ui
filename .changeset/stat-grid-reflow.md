---
'@refraction-ui/react': minor
'@refraction-ui/astro': minor
---

`StatGrid` reflows: columns are responsive classes (1 on phones, up to the requested count) instead of a fixed inline `grid-template-columns`, and `columns="auto"` fits as many ~12rem items as the width allows. New `variant` (`plain` callouts | `card` KPI cards), `layout` (`value-first` | `label-first`), and per-item `id`, `description`, `tone` (`default | positive | negative | caution`) and `props` (item attributes).
