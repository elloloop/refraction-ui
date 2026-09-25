---
'@refraction-ui/react': patch
---

`DialogContent` only sets `aria-labelledby` / `aria-describedby` when a `DialogTitle` / `DialogDescription` is actually rendered. Previously both always pointed at ids that might not exist, leaving an unnamed dialog that looked labelled; without a title, name the dialog with `aria-label`.
