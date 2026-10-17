# LiveTranscript: sides, interim lines and auto-follow

Captured from the LiveTranscript docs page (`/components/live-transcript`) served
locally in development mode, at 1280 and 390 pixels wide, in the light and dark
themes. Each image is cropped to one example so the change is easy to see.

- `after-sides-*`: the "Me and them" example. Your lines sit at the end edge in
  an outlined, lightly tinted bubble; the other side sits at the start edge.
- `after-interim-*`: the "Interim lines" example. The partial line is muted with
  a dotted underline; screen readers hear "(still listening)" after it.
- `after-following-*`: the "Auto-follow" demo after one recogniser result. The
  newest (interim) line is in view.
- `after-paused-*`: the same demo after scrolling up. Following pauses and the
  "Jump to live" control is held at the bottom of the panel.

Before this change the page had none of these examples; the before images in the
pull request are the existing visual baselines of the page on `main`. The images
contain only the generic example data on the docs page.
