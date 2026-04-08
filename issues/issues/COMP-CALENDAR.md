---
id: COMP-CALENDAR
track: components
depends_on: ["COMP-API-CONTRACT", "COMP-BUTTON"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build Calendar component — full month calendar grid with navigation, today highlighting, and date selection.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/calendar` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-calendar` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-calendar` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-calendar` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/tell-a-tale** | `src/features/admin/components/Calendar.tsx` | Full month grid using `date-fns`. Month navigation (prev/next with ChevronLeft/Right ghost buttons). Day-of-week header row. 7-column CSS grid. Today highlighting (primary color). Current-month dimming for overflow days. `onDateClick` callback. |

## Acceptance Criteria

- [ ] Month grid view with day-of-week headers
- [ ] Month navigation (previous/next) with arrow buttons
- [ ] Today highlighting (accent color)
- [ ] Overflow days from adjacent months (dimmed)
- [ ] `onDateClick(date)` callback for date selection
- [ ] Selected date visual indicator
- [ ] Date range selection mode (optional)
- [ ] Disabled dates support
- [ ] Keyboard navigation (arrow keys between days, Enter to select)
- [ ] ARIA: `role="grid"`, `aria-label`, proper date announcements
- [ ] Uses date-fns for date math (peer dep)
- [ ] Unit tests + Storybook stories

## Dependencies

- `date-fns` (peer)
