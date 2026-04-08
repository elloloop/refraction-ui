---
id: LAYOUT-MOBILE-NAV
track: layout
depends_on: ["PKG-CORE"]
size: S
labels: [feat, a11y]
status: pending
---

## Summary

Build MobileNavigation — hamburger menu with full-width dropdown for mobile viewports.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/mobile-nav` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-mobile-nav` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-mobile-nav` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-mobile-nav` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/shared/components/MobileNavigation.tsx` | `md:hidden`. Full-width dropdown with nav items. Open/close toggle with X/hamburger icon animation. Same links as desktop Navigation. |

## Acceptance Criteria

- [ ] Hamburger icon button (3 lines) toggles menu
- [ ] Animated icon transition (hamburger <-> X)
- [ ] Full-width dropdown panel with nav links
- [ ] Visible only on mobile (`md:hidden`)
- [ ] Click-outside or Escape to close
- [ ] Active link highlighting
- [ ] Focus trap when open
- [ ] ARIA: `aria-expanded`, `aria-controls`, `role="menu"`
- [ ] Smooth open/close animation
- [ ] Unit tests + Storybook stories
