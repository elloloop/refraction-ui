# Floating reactions motion

Captured from production docs builds (`next build` + `next start`) in Chromium. Before is `main` at the merge base; After is this branch.

## Page

`before-floating-reactions-*.png` and `after-floating-reactions-*.png` show the union of the example sections on the floating-reactions page, at 375, 768 and 1440 px, in light and dark themes, with reduced motion set so nothing moves while it is captured.

- **Before:** the Static burst example used a `FloatingReactions` overlay. In the Interactive example the label sat in the middle of the stage, and a reaction appeared on top of the buttons (see the before motion strip).
- **After:**
  - The Static burst example draws `ReactionBurst`s, which hold still.
  - The Interactive label sits at the top of the stage, and the overlay ends above the buttons, so a reaction starts clear of both.
  - A new Motion section says how long a reaction lives and what reduced motion does.

## Motion

Each `*-motion-*.png` strip is the middle of the Interactive stage after one click on 🎉. The frames are at 0, 0.75, 1.5, 2.25 and 2.85 s of the reaction's 3 s life. After, each frame pauses the reaction's animation and seeks it to that time. Before, there is no animation to seek, so each frame waits for that time to pass.

| Strip | Animation | Top edge, px (0 → 2.85 s) | Opacity (0 → 2.85 s) |
|---|---|---|---|
| `before-motion-1440-light-no-preference` | `float-up`, which has no keyframes | 550.2 at every frame | 1 at every frame, then the reaction disappears at 3 s |
| `after-motion-1440-light-no-preference` | `rfr-floating-reaction-rise` | 494.2 → 485.1 → 477.8 → 472.4 → 470.3 | 1 → 1 → 1 → 1 → 0.093 |
| `after-motion-375-dark-no-preference` | `rfr-floating-reaction-rise` | 494.4 → 485.3 → 477.9 → 472.6 → 470.5 | 1 → 1 → 1 → 1 → 0.093 |
| `after-motion-1440-light-reduce` | `rfr-floating-reaction-fade` | 494.2 at every frame | 1 → 1 → 1 → 1 → 0.093 |

The rise keeps the library's existing distance, `translateY(-80%)` of the reaction's own height (about 24 px for a 30 px glyph).

The images show only the docs fixtures: emoji and demo labels, no customer data.
