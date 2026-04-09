---
id: DATA-PROGRESS
track: data-display
depends_on: ["PKG-CORE", "COMP-BADGE"]
size: M
labels: [feat]
status: pending
---

## Summary

Build ProgressDashboard and BadgeDisplay — stats cards, mastery indicators, and achievement badge grids.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/progress-display` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-progress-display` | React wrapper | React component with hooks binding |
| `@elloloop/angular-progress-display` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-progress-display` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/learnloop** | `components/practice/ProgressDashboard.tsx` | Student progress: level, accuracy, topics mastered, topic-by-topic stats with mastery indicators. |
| **elloloop/learnloop** | `components/achievements/BadgeDisplay.tsx` | Badge grid (2-4 columns responsive). Shows unlocked/locked badges with icon circles, names, descriptions, unlock dates. Lucide icon map (BookOpen, Flame, Zap, Star, Timer, Trophy, Compass, Medal). |
| **elloloop/stream-mind** | `frontend/src/app/profile/page.tsx` | 2x2 stats cards (watched, liked, watchlist, dismissed). |

## Acceptance Criteria

- [ ] `<StatsGrid>` — responsive grid of stat cards (number + label)
- [ ] `<ProgressBar>` — horizontal bar with percentage fill and label
- [ ] `<MasteryIndicator>` — visual mastery level (e.g., colored circle/ring)
- [ ] `<BadgeDisplay>` — grid of badges with unlocked/locked states
- [ ] Badge: icon, name, description, unlock date, locked overlay
- [ ] Responsive: 2 columns on mobile, 3-4 on desktop
- [ ] Color variants for stat cards
- [ ] Animated count-up on mount (optional)
- [ ] Unit tests + Storybook stories
