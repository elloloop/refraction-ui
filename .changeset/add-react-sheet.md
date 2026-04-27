---
"@refraction-ui/react-sheet": minor
"@refraction-ui/react": minor
---

Add `@refraction-ui/react-sheet` — a transient slide-in panel primitive (Sheet / Drawer).

Distinct from `@refraction-ui/react-sidebar` (persistent navigation), Sheet is for mobile nav, share menus, and side-modals. Symmetric API to `Dialog`: compound components (`Sheet`, `SheetTrigger`, `SheetOverlay`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`), controlled/uncontrolled `open`, `onOpenChange`, focus trap, ESC-to-close, click-outside, focus restoration. Adds a `side` prop (`'top' | 'right' | 'bottom' | 'left'`, default `'right'`).

Implemented from scratch — no Radix or Headless UI dependency. Re-exported from the `@refraction-ui/react` meta package.
