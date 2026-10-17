---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

ReactionBar: show who reacted, fold long bars behind "+N", and hand the add button to a picker.

- A `Reaction` takes an optional `label` (its accessible name; defaults to the emoji) and `reactors` (who reacted). A pill with reactors gets a tooltip, "Ana, Sam and 3 others reacted with Agree", on hover and keyboard focus but not on touch; Escape dismisses it before an enclosing dialog sees the key, and the pill references it with `aria-describedby`. The tooltip lines up with the pill's start edge, or its end edge when that keeps it on screen (`getReactorsTooltipAlign`). `formatReactorNames` is exported for the same sentence elsewhere.
- `maxVisible` shows that many reactions and a "+N" button (`aria-expanded`, "Show N more reactions") that expands the bar in place and collapses it again.
- `strings` overrides every user-facing string: the group label, the add label, the overflow text and labels, each pill's name and the who-reacted sentence.
- Pills, the add button and the overflow button show a focus-visible ring, and drop their colour transition under reduced motion.
- The Astro bar now toggles, expands and shows who reacted in the browser too, with every string resolved on the server, and `@refraction-ui/astro` exports it: `import { ReactionBar } from '@refraction-ui/astro'` (before, the meta exported nothing for it).

**Breaking change:** the add button no longer reports a hard-coded 👍. (This is technically a breaking change but is being shipped as a `minor` per `0.x` semver convention.)

Migration:

- React: `onAdd(emoji)` is now `onAddReaction(trigger)`, called with the add button so a picker can anchor to it and return focus to it. The add button renders only when `onAddReaction` is given; `showAddButton={false}` still hides it.
- Headless core: `createReactionBar` no longer takes `onAdd` or returns `add()`; open your picker from the add button and call `toggle(emoji)` or update `reactions` with the choice.
- Astro: the `rfr-reaction-add` event's detail is `{ trigger }` (the add button) instead of `{ emoji }`.
