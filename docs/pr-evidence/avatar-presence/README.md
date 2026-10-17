# Avatar: a presence dot

Captured from the docs site's Avatar page in Chromium (Playwright), reduced
motion, at 1280 px (2x) and 390 px (2x). "Before" is origin/main; "after" is
this branch. The after page adds a Presence section; the existing sections
render the same.

- `before-examples.png` / `after-examples.png`: Sizes and Image & Fallback are
  unchanged now that the root no longer clips (the image and the fallback clip
  themselves). The new Presence section shows the five statuses on named
  avatars, the dot at every size, and a square avatar. Each dot sits whole on
  the avatar's edge with a ring in the page background.
- `after-presence-dark.png`: the same example in the dark theme.
- `before-mobile.png` / `after-mobile.png`: at phone width, the last section of
  the page (Image & Fallback before, Presence after) wraps without clipping a
  dot.
- `before-props.png` / `after-props.png`: the props table gains `presence` and
  `presenceLabel`.

The Astro component was captured at 720 px (2x) from a throwaway `astro dev`
page (not committed) that renders `Avatar.astro` with the same markup on both
sides: six named avatars, each passing `presence`, and the storybook's tokens.

- `before-astro.png`: origin/main has no `presence` prop; the attribute passes
  through to the element and nothing shows.
- `after-astro.png`: the dots, and each avatar is named with its status
  ("Ada Lovelace (Online)"). The offline dot is filled by `bg-neutral`, and the
  storybook tokens define no `--neutral` (the docs site does), so it shows only
  its ring there; the PresenceIndicator's offline dot behaves the same today.

Every image uses the generic docs fixture names only.
