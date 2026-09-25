---
'@refraction-ui/react': patch
---

Fix `Command`: items never registered with the root, so `CommandEmpty` always rendered, no item was ever `aria-selected`, typing did not filter and Enter did nothing. Items are now known from the element tree (so the first and server render are correct) plus registration on mount; the search filters them (custom `filter` honoured), Arrow keys move the highlight, Enter and click run the item's `onSelect`, hovering highlights, and the input's `aria-activedescendant` follows the highlight. Ids are stable (`useId`). An item's value is its `value` prop, else its text.
