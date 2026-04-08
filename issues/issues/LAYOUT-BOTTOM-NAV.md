---
id: LAYOUT-BOTTOM-NAV
track: layout
depends_on: ["PKG-CORE"]
size: S
labels: [feat, a11y]
status: pending
---

## Summary

Build BottomNav (mobile bottom tab bar) — fixed bottom, icon + label tabs with active indicator. Visible only on mobile.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/bottom-nav` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-bottom-nav` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-bottom-nav` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-bottom-nav` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/stream-mind** | `frontend/src/packages/ui/BottomNav.tsx` | Fixed bottom, 4 tabs (Discover, Search, Watchlist, History) with filled/outlined SVG icons. Active state = yellow-400. `md:hidden`. Safe area padding. |
| **elloloop/learnloop** | `components/nav/StudentBottomNav.tsx` | Fixed bottom (`md:hidden`), 4 tabs (Home, Practice, Library, Progress). Active indicator dot. |

## Acceptance Criteria

- [ ] Fixed bottom position with safe area padding (notched devices)
- [ ] Configurable tabs: icon + label per tab
- [ ] Active tab detection via pathname
- [ ] Active state: filled icon, accent color, optional indicator dot
- [ ] Inactive state: outlined icon, muted color
- [ ] Visible only on mobile (`md:hidden`)
- [ ] Supports 3-5 tabs
- [ ] Keyboard accessible
- [ ] ARIA: `<nav>`, `role="tablist"`, `aria-current`
- [ ] Unit tests + Storybook stories

## API

```tsx
<BottomNav
  tabs={[
    { label: "Home", href: "/", icon: HomeIcon, activeIcon: HomeFilledIcon },
    { label: "Search", href: "/search", icon: SearchIcon },
  ]}
/>
```
