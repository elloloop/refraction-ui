---
id: COMP-BADGE
track: components
depends_on: ["COMP-API-CONTRACT"]
size: S
labels: [feat]
status: pending
---

## Summary

Build Badge component — small status/label indicator with color variants.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/badge` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-badge` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-badge` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-badge` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/featuredocs** | `src/components/FeedbackBadge.tsx` | Pill badge showing count (e.g., "3 reports"). Orange background with icon. Returns null when count is 0. |
| **elloloop/featuredocs** | `src/components/AdminFeedbackTable.tsx` | `TypeBadge` (text/video/general, color-coded) and `StatusBadge` (open/acknowledged/fixed/dismissed, color-coded). |
| **elloloop/learnloop** | `components/nav/AppHeader.tsx` | Role badge (color-coded per UserRole: student, parent, admin, reviewer). |
| **elloloop/learnloop** | `app/globals.css` | `.badge` component class with dark mode variant. |

## Acceptance Criteria

- [ ] Pill-shaped label with text
- [ ] Color variants: default, primary, secondary, destructive, warning, success, info
- [ ] Size variants: sm, md
- [ ] Optional icon (left position)
- [ ] Optional count display
- [ ] Returns null / hidden when count is 0 (configurable)
- [ ] Supports custom className
- [ ] Theme-aware via CSS custom properties
- [ ] Unit tests + Storybook stories
