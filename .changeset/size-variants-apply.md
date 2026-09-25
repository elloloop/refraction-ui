---
'@refraction-ui/react': patch
'@refraction-ui/astro': patch
---

Size variants now actually apply. `cn` does not merge Tailwind conflicts, so size-owned utilities in a cva `base` (e.g. `h-9 text-sm`) beat the variant (`h-8 text-xs`) by stylesheet order. Moved them into the variants for `Input`, `Textarea`, `Button`, `Badge` and `ProgressBar`. `Button` also gains `icon-sm` and `icon-xs` sizes.
