---
'@refraction-ui/react': patch
---

SlideViewer: arrow-key navigation (ArrowRight/ArrowLeft) now actually re-renders the component — previously the headless state advanced and `onSlideChange` fired, but the slide counter, progress bar, content, and button states stayed stale until the next click.

Also re-aligns the version/changelog history: a stale merge tree in #442 clobbered the 0.18.1 bump and its changelog entry (the slide-viewer change was then written as a duplicate 0.18.1 in #445), so this patch publishes the SlideViewer fix for real.
