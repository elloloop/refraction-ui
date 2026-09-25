---
'@refraction-ui/react': minor
---

`Select` fixes and `SelectValue`:

- Trigger/listbox ids are now stable (`useId`), so `aria-controls` / `aria-labelledby` resolve. The trigger no longer labels itself (`aria-labelledby` pointed at an id from a different render and overrode a caller's `aria-label`); name it with `aria-label` or a `<label for>`.
- New `SelectValue` shows the selected item's label (or the placeholder) inside `SelectTrigger`, even while the list is closed.
- New uncontrolled `defaultValue`.
- The listbox now floats under the trigger (the root renders a `relative` wrapper, `className` applies to it) and closes on a pointer press outside.
- `SelectTrigger` `size="sm"` / `"lg"` now apply: the base classes no longer hard-code the default height and text size.
