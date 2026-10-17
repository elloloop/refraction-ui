# Call controls dock

Captured from production docs builds (`next build` + `next start`) in Chromium with reduced motion. Before is `main` at the merge base; After is this branch. Each page capture is the union of the example sections on the call-controls page, at 375, 768 and 1440 px, in light and dark themes.

- `before-call-controls-*.png`: the page on `main`, with only the composable bar (basic, toggled and leave examples).
- `after-call-controls-*.png`: the same examples, unchanged, followed by the new Call dock, Narrow dock and Device menus sections. At 768 px the docs column is narrower than 600 px, so the Call dock example is already collapsed: the collapse follows the dock's own width, not the window.
- `after-interaction-1-more-open-*.png`: the 360 px narrow dock with More controls opened by keyboard (Enter) and the focus moved to the second row with the down arrow. Rows show a check mark for controls that are on and the count for chat and participants.
- `after-interaction-2-device-menu-*.png`: the microphone capsule's device menu open after a click, with the current device checked.
- `after-interaction-3-focus-ring-1440-dark.png`: the wide dock after the right arrow moved focus from Microphone to Camera, showing the focus ring.

The images show only the docs fixtures: generic device names and a demo status line, no customer data.
