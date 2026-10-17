# Reaction bar: who reacted, overflow and the add button

Captured from the docs site's Reaction Bar page in Chromium (Playwright), light
appearance, reduced motion, at 1280 px (2x) and 390 px (2x). "Before" is
origin/main; "after" is this branch. Both serve the same page with the same
example data; the after page adds a second example.

- `before-examples.png` / `after-who-reacted.png`: the basic example loses its
  add button, which reported a hard-coded thumbs-up and now renders only when
  the page supplies a picker. The new example shows a keyboard-focused pill
  (focus ring) with its who-reacted tooltip, labelled reactions and a "+2"
  overflow button.
- `after-overflow-picker.png`: "+2" expanded to "Show less" by keyboard, and
  the add button opened the page's EmojiPicker with focus in its search field.
- `before-mobile.png` / `after-mobile.png`: at phone width the tooltip of the
  pill nearest the far edge lines up with that pill's end edge and stays on
  screen.
- `before-props.png` / `after-props.png`: the props table (`onAdd` replaced by
  `onAddReaction`; `showAddButton`, `maxVisible` and `strings` documented).

The Astro component was captured the same way at 720 px (2x), from a throwaway
`astro dev` page (not committed) that renders the meta's dist copy of
`ReactionBar.astro` with the docs data; on origin/main the Astro story passed
no reactions, so it showed nothing to compare.

- `before-astro.png`: origin/main ignores labels and reactors, has no overflow,
  and its add button reported a hard-coded thumbs-up.
- `after-astro-who-reacted.png`: hovering a pill shows who reacted; past three
  reactions the bar folds the rest behind "+2".
- `after-astro-overflow.png`: "+2" expanded by keyboard, then Shift+Tab to the
  last pill, which shows its focus ring and tooltip.

Every image uses the generic docs fixture names only.
