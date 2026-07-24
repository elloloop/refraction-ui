---
'@refraction-ui/react': patch
---

SlideViewer: arrow-key navigation (ArrowRight/ArrowLeft) now actually re-renders the component — previously the headless state advanced and `onSlideChange` fired, but the slide counter, progress bar, content, and button states stayed stale until the next click.
