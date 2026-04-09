---
id: MEDIA-ANIMATED-TEXT
track: media
depends_on: ["PKG-CORE"]
size: S
labels: [feat]
status: pending
---

## Summary

Build AnimatedText — scrolling word carousel and character-by-character text reveal animations.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/animated-text` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-animated-text` | React wrapper | React component with hooks binding |
| `@elloloop/angular-animated-text` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-animated-text` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/shared/components/AnimatedText.tsx` | `requestAnimationFrame`-based word carousel. Props: `words[]`, `interval`, `className`. Ease-in-out transitions between words. 2.5s pause, 1s scroll. |
| **elloloop/learnloop** | `components/tutoring/blocks/HandwrittenText.tsx` | Character-by-character text reveal via opacity toggling. |
| **elloloop/learnloop** | `lib/canvas/whiteboard-engine.ts` | 60fps canvas char-by-char text animation with red marker cursor and grid background. |

## Acceptance Criteria

- [ ] `<AnimatedText words={[...]} />` — word carousel with smooth scrolling
- [ ] Configurable interval between words and transition duration
- [ ] `<TypewriterText text="..." />` — character-by-character reveal
- [ ] Configurable typing speed
- [ ] Cursor indicator during typing
- [ ] `onComplete` callback when all text revealed
- [ ] Respects `prefers-reduced-motion` (shows final state immediately)
- [ ] Unit tests + Storybook stories
