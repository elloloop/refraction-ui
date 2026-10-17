---
'@refraction-ui/react': patch
---

Fix `DropdownMenuContent` with `align="end"` or `align="center"` opening at the left edge of the page the first time it opens. The menu is now measured at its own width, not the width of `<body>`, before it is placed against the trigger.
