---
'@refraction-ui/react': patch
---

`DropdownMenuContent` is anchored under its trigger: it was portalled to `<body>` with no positioning. It now uses fixed coordinates from the trigger (following scroll and resize), gains `align` (`start | center | end`) and `sideOffset`, and closes on a pointer press outside the menu and trigger. `computeMenuPosition` is exported for reuse.
