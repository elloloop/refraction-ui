---
"@refraction-ui/react": minor
---

feat(react): `asChild` composition for Card, Badge, Callout, and LinkCard

An external review noted `asChild` existed only on a handful of components
(Button, Dialog, DropdownMenu, FileTree, Form's Slot), so a clickable Card or
a linked Badge could not be composed. This adds Radix-style `asChild` to the
root of `Card`, `Badge`, `Callout`, and `LinkCard`:

- `<Card asChild><a href="/x">…</a></Card>` renders the anchor with the
  card's classes/props merged — className concatenated, ref forwarded,
  remaining props spread onto the child. Each expects exactly one React
  element child; the default render path is untouched when `asChild` is
  absent.
- The shared `Slot` primitive (previously private to `react-form`) is
  extracted into `@refraction-ui/react-slot` and re-exported from the meta
  root, so every adapter builds on the same implementation.
  `@refraction-ui/react/form` keeps re-exporting `Slot` unchanged.
