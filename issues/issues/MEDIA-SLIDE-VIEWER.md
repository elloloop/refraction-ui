---
id: MEDIA-SLIDE-VIEWER
track: media
depends_on: ["PKG-CORE", "COMP-BUTTON"]
size: L
labels: [feat, a11y]
status: pending
---

## Summary

Build SlideViewer — full-screen course/presentation slide viewer with keyboard/touch/swipe navigation, progress tracking, and bookmarks.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/slide-viewer` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-slide-viewer` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-slide-viewer` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-slide-viewer` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/shared/components/SlideViewer.tsx` | Full-screen presentation viewer. Keyboard/touch/swipe navigation, progress bar, slide type badges (lesson/quiz/exercise/intro/summary), quiz answer selection with explanations, bookmark management (important/difficult/to-revise), share menu (copy link, Twitter, LinkedIn), language selector, content protection, course linking. |

## Acceptance Criteria

- [ ] Full-screen slide presentation mode
- [ ] Keyboard navigation: Left/Right arrows, Escape to exit
- [ ] Touch/swipe navigation: swipe left/right
- [ ] Progress bar showing current position
- [ ] Slide type badges (lesson, quiz, exercise, intro, summary)
- [ ] Quiz slide support: answer selection, explanations, correct/incorrect feedback
- [ ] Bookmark system: mark slides as important/difficult/to-revise
- [ ] Share menu: copy link, social sharing (Twitter, LinkedIn)
- [ ] Language selector integration
- [ ] Content protection option (disable copy/context menu)
- [ ] `onSlideChange(index)`, `onComplete()` callbacks
- [ ] Reduced motion support
- [ ] ARIA: proper slide labeling, keyboard instructions
- [ ] Unit tests + Storybook stories
