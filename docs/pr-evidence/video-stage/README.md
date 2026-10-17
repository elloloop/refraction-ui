# Video stage

The new `video-stage` docs page, captured from a production build of the docs site
(`next build` + `next start`) at 375, 768 and 1440 pixels in the light and dark themes,
with reduced motion on. Each `after-video-stage-*` image is the union of the page's
example sections; code blocks and the props table are left out.

- Before: there was no stage on `main` (5602fbb1). The closest existing pattern is the
  video grid's speaker view, so the before images are
  `../video-grid-render-tile/before-video-grid-*.png`, captured from `main` at 5602fbb1.
- `after-*`: this branch.

## What is on screen

- Grid: four participants in a 2 × 2 grid that fills the stage. Every tile has an options
  chevron at its top-right corner; Pia has a raised hand, Owen a muted mic.
- Paging: nine participants in two rows that scroll sideways at 1440 and 768, and in two
  columns that scroll down in the portrait 375 frame, with previous and next buttons and
  a thumb.
- Presentation: Owen's shared screen ("Owen Price (Presenting)") on the stage and the
  cameras in a rail beside it at 1440 and 768, and below it at 375, where the stage is
  narrower than 600 px.
- Pin and maximize: the controlled example with its "Nobody is pinned." status line.
- Active speaker: Pia speaking takes the stage with a success-toned edge and a sound-wave
  icon beside her name.
- Narrow and portrait stages: two 20rem-wide stages, a presentation with its rail below
  and a grid paging downward, at every viewport.

## Interaction captures

`after-interaction-*` show the "Team call" example driven from the keyboard in a real
browser (Playwright, chromium):

1. `1-options-open`: Pia's options open beside the trigger, with Spotlight, Maximize and
   the example's own "Mute Pia Berg for me".
2. `2-pinned`: after Spotlight, Pia on the stage with the pin badge and the others in the
   rail; the status line reads "Pinned: Pia Berg.".
3. `3-maximized`: after Maximize, Pia's tile covers the whole stage with a Minimize
   button.
4. `4-rail-options` (375, dark): the options of a small rail tile open and fit inside it.

Focus was checked in the same run: after Spotlight it is on "Options for Pia Berg" in
her new tile, after Maximize on "Minimize", and after Escape back on "Options for Pia
Berg". The page logged no errors.

The media in the docs is static SVG, so the page screenshots the same on every run. The
Storybook `LiveStream` story plays a real `<video>` fed by a canvas `MediaStream`.

The images hold only generic fixture names; no customer data.
