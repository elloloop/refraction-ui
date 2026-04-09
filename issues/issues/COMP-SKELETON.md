---
id: COMP-SKELETON
track: components
depends_on: ["COMP-API-CONTRACT"]
size: S
labels: [feat]
status: pending
---

## Summary

Build Skeleton loading primitives — pulse-animated placeholder shapes for loading states.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/skeleton` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-skeleton` | React wrapper | React component with hooks binding |
| `@elloloop/angular-skeleton` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-skeleton` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/stream-mind** | `frontend/src/features/discover/Skeleton.tsx` | `HeroSkeleton` (full-viewport pulse), `MovieCardSkeleton` (poster-ratio card), `LaneSkeleton` (horizontal row of card skeletons), `SearchBarSkeleton` (input-shaped skeleton). All use `animate-pulse` on gray backgrounds. |
| **elloloop/tell-a-tale** | `src/features/story/components/StoryImage.tsx` | Pulse skeleton for image loading state (inline, not extracted). |

## Acceptance Criteria

- [ ] `<Skeleton>` base component with pulse animation
- [ ] Shape variants: `text`, `circular`, `rectangular`, `rounded`
- [ ] Configurable width and height
- [ ] `<Skeleton.Text lines={3}>` for multi-line text placeholder
- [ ] Composable: build custom skeletons from primitives
- [ ] Pre-built skeletons: `CardSkeleton`, `HeroSkeleton`, `ListSkeleton`
- [ ] Respects `prefers-reduced-motion` (static gray instead of pulse)
- [ ] Theme-aware skeleton colors
- [ ] Unit tests + Storybook stories
