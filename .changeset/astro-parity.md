---
"@refraction-ui/astro": minor
---

feat(astro): real Pagination, FileTree, Slider, SkipToContent and Steps components

Replaces the placeholder astro adapters with real SSR implementations on the
shared headless cores, mirroring the React adapters' markup and ARIA:

- **Pagination** — `role="navigation"` landmark with windowed page ranges,
  ellipses, `aria-current="page"` and prev/next edge semantics from
  `@refraction-ui/pagination`. Activation is delivered as a bubbling
  `rfr-page-change` CustomEvent; consumers re-render (or navigate) with the
  requested page.
- **FileTree** — nested `role="tree"` / `treeitem` / `group` markup with
  level/expansion/selection ARIA from `@refraction-ui/file-tree`. Expansion and
  selection are static SSR props (`expandedIds` / `selectedId`); activation is
  delivered as `rfr-file-tree-select` / `rfr-file-tree-toggle` CustomEvents.
- **Slider** — new `Slider.astro` (the package previously shipped no
  component): a native `<input type="range">` with core-normalized value and
  slider ARIA; value changes are delivered as `rfr-value-change` CustomEvents.
- **SkipToContent** — visually-hidden-until-focused skip link from
  `@refraction-ui/skip-to-content`.
- **Steps** — real `Steps` / `Step` wrappers consuming `@refraction-ui/steps`
  variants and data-slot hooks, alongside the existing step partials.

Prop-parity fixes: `Calendar` accepts a `today` ISO string (injected reference
date for `isToday` / `aria-current` and the initial month, keeping SSR and
client hydration in agreement), and `DatePicker` renders the formatted-date
text next to the native input when `format` is set, matching the React
adapter.
