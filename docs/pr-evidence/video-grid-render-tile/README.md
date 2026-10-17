# Video grid live media and tile options

The `video-tile` and `video-grid` docs pages, captured from a production build of the
docs site (`next build` + `next start`) at 375, 768 and 1440 pixels in the light and dark
themes, with reduced motion on. Each image is the union of the page's example sections;
code blocks and the props table are left out.

- `before-*`: `main` at 5602fbb1.
- `after-*`: this branch.

## What changed on screen

**Video tile**

- Small tiles: before, the 4rem initials circle ran under the name chip on every tile in
  the first two examples. After, the avatar fills the space above the chip's band (at most
  4rem) and the initials are drawn to the circle's size.
- Speaking and pinned: before, an outer ring that a clipping parent cuts off. After, an
  inset edge in the success or primary token, plus a sound-wave icon in the name chip
  (speaking) or a pin badge (pinned), so neither cue relies on colour.
- New sections: live media, a raised hand, a shared screen (letterboxed, named
  "Gabe Lin (Presenting)" and truncated from the end), and tile options (a dropdown menu
  trigger in the `menu` slot).

**Video grid**

- Small group: before, the third tile overlapped the first and spilled out of the example
  card, because the rows stretched to the fixed docs height. After, the rows pack to the
  top and the example has no fixed height.
- Speaker view: before, the spotlight tile kept 16:9 inside a shorter area, so its avatar
  and name chip were clipped. After, the spotlight tile fills its area.
- New sections: live media through `renderMedia` (camera frames, a shared screen and a
  raised hand), and custom tiles through `renderTile`, where each filmstrip tile has a
  labelled "Spotlight <name>" button.

The media in the docs is static SVG, so the page screenshots the same on every run. The
Storybook `LiveStream` stories play a real `<video>` fed by a canvas `MediaStream`.

The images hold only generic fixture names; no customer data.
