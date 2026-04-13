---
"@refraction-ui/select": patch
"@refraction-ui/react-select": patch
"@refraction-ui/astro-select": patch
---

fix(select): add missing keyboard navigation and hover styles

- Added `hover:bg-accent` to `selectItemVariants` so options display visual feedback when hovered.
- Implemented full keyboard navigation (`ArrowUp`, `ArrowDown`) within `SelectContent` for both React and Astro components.
- Added automatic focus trap/return so focus correctly returns to the trigger when the dropdown is closed via `Escape` or by making a selection.
