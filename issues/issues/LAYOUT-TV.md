---
id: LAYOUT-TV
track: layout
depends_on: ["PKG-CORE"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build TV/10-foot UI components — TVLayout, FocusRing, and useFocusManager for D-pad/keyboard navigation on large screens (smart TVs, game consoles).

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/tv-layout` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-tv-layout` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-tv-layout` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-tv-layout` | Astro wrapper | Astro component (static or island) |

## Source References

All from **elloloop/stream-mind** `frontend/src/features/tv/`:

| File | Description |
|------|-------------|
| `TVLayout.tsx` | TV-optimized page wrapper. No navbar/bottom nav. Initializes focus manager, global keyboard listener. Render-prop pattern. |
| `TVHero.tsx` | TV hero section. 70vh, larger typography (4xl-6xl), D-pad focusable buttons with FocusRing. |
| `TVLane.tsx` | TV horizontal lane. Larger spacing (gap-6), auto-scrolls focused card to center via `scrollIntoView`. No mouse scroll arrows. |
| `TVMovieCard.tsx` | TV card. 400-460px wide, scale-up on focus, FocusRing wrapper. No hover effects. |
| `FocusRing.tsx` | Visual focus indicator for D-pad/keyboard navigation. Yellow ring + glow shadow. Auto-detects keyboard vs mouse/touch. |
| `use-focus-manager.ts` | 2D focus grid (rows x columns). Handles Arrow keys, Enter (select), Escape/Backspace (back). Auto-scrolls focused elements into view. |

## Acceptance Criteria

- [ ] `<TVLayout>` provides focus manager context, attaches global keyboard listener
- [ ] `<FocusRing>` wraps any element with visible focus indicator (ring + glow)
- [ ] FocusRing auto-detects keyboard vs mouse/touch (only shows on keyboard)
- [ ] `useFocusManager()` maintains 2D focus grid (rows x columns)
- [ ] Arrow key navigation: Up/Down between rows, Left/Right within rows
- [ ] Enter key selects focused element
- [ ] Escape/Backspace navigates back
- [ ] Auto-scrolls focused element into view
- [ ] Scale-up effect on focused elements
- [ ] TV-optimized spacing (larger gaps, bigger text)
- [ ] No hover effects (touch/mouse irrelevant on TV)
- [ ] Unit tests for focus manager navigation logic
- [ ] Storybook stories with keyboard-only interaction

## Notes

- This is unique to stream-mind but valuable for any app targeting TV platforms (LG webOS, Samsung Tizen, Fire TV)
- The focus manager is generic enough to improve keyboard accessibility in any app
