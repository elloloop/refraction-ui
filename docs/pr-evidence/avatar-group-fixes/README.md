# AvatarGroup: whole dots, a photo fallback and a "+N" button

Captured from the docs site's Avatar Group page in Chromium (Playwright),
reduced motion, at 1280 px (2x, close-ups 4x) and 390 px (2x). "Before" is
origin/main; "after" is this branch.

- `before-examples.png` / `after-examples.png`: the basic example renders the
  same. The after page adds "Presence, missing photos and everyone else": six
  people with a status each, in a large and a small stack, where Grace
  Hopper's photo URL is missing (it 404s).
- `before-presence.png` / `before-presence-zoom.png`: that same new example,
  rendered by origin/main's component (the after page's docs files copied
  over main for the capture, not committed). Each dot is cut by its avatar's
  edge, the missing photo shows the browser's broken-image marker and its alt
  text ("Grac…") spills over, and "+2" is a `div` with `role="button"` that
  cannot be focused or pressed.
- `after-presence-zoom.png`: the dots are whole and sit over the next avatar;
  Grace Hopper falls back to "GH".
- `after-overflow-focus.png` / `after-overflow-dialog.png`: Tab reaches the
  "+2" button, which shows the focus ring; Enter opens the docs' list of
  everyone (a Dialog, using the PresenceIndicator's status words).
- `after-presence-dark.png`: the same example in the dark theme.
- `before-mobile.png` / `after-mobile.png`: the last examples section at phone
  width.
- `before-props.png` / `after-props.png`: the props table gains
  `onOverflowClick`, and `users` describes the status and the fallback.

The Astro component was captured at 720 px (2x) from a throwaway `astro dev`
page (not committed) rendering the meta's `AvatarGroup.astro` with the same
six people on both sides, the large stack with `overflowButton`, and the
storybook's tokens.

- `before-astro.png`: clipped dots, the broken photo with its alt text, and a
  `role="button"` badge that does nothing.
- `after-astro.png`: whole dots, "GH" for the missing photo, and the "+2"
  button focused by Tab with its ring. The small stack keeps a labelled badge.

The offline person sits behind "+2" in every capture, so no image shows the
offline dot.
