---
'@refraction-ui/react': minor
---

Add `PaneHeader` to `@refraction-ui/react`: the fixed-height bar across the top of a pane, with `leading`, `avatar`, `title`, `subtitle`, `actions`, an optional `onTitleTap` title button and a configurable `headingLevel`. Panes share one height through the `--pane-header-height` custom property (default `3.5rem`, set with `paneHeaderHeightStyle()` or the `height` prop), so the rules under side-by-side panes line up. (#566)
