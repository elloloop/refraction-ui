---
"@refraction-ui/react": minor
---

feat: real accordion/carousel/pagination/slider headless cores + FileTree implementation

- `@refraction-ui/accordion` core owns the disclosure state machine (single/multiple, collapsible, controlled+uncontrolled); `react-accordion` consumes it (public API unchanged).
- `@refraction-ui/carousel` core shares that state machine (the shipped "Carousel" is an expand/collapse panel set, as demoed on the docs site); `react-carousel` consumes it (public API unchanged).
- `@refraction-ui/pagination` core computes the windowed page range with ellipses plus prev/next edges and nav ARIA; `react-pagination` now renders a real pagination nav (children still override the generated controls).
- `@refraction-ui/slider` core owns value clamping/step rounding, keyboard rules, and slider ARIA; `react-slider` is wired to it (`onChange` now reports the numeric value, as the docs already promised).
- `@refraction-ui/file-tree` core + `react-file-tree` implement a real tree view (node model, expand/collapse, selection, treeview keyboard navigation, ARIA); `<FileTree />` no longer renders an empty div.
