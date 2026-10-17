---
'@refraction-ui/react': minor
---

Add `ListItem`, `ListItemGroup` and `ListItemAction` to `@refraction-ui/react` (#563): a selectable row with `leading`, `title` + `meta`, `subtitle`, `trailing` and a separate `action`, `selected` / `emphasized` (unread) states and `compact` / `comfortable` density. `ListItemGroup context="listbox"` gives a roving-focus listbox (Arrow keys, Home / End; `selected` → `aria-selected`); `context="navigation"` gives a list of buttons where `selected` → `aria-current`.
