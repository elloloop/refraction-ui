---
id: LAYOUT-NAVBAR
track: layout
depends_on: ["PKG-CORE", "THEME-PROVIDER"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build Navbar (desktop top navigation) — fixed header with logo, nav links, active state, and optional right-side actions. Hidden on mobile in favor of BottomNav.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/navbar` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-navbar` | React wrapper | React component with hooks binding |
| `@elloloop/angular-navbar` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-navbar` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/stream-mind** | `frontend/src/packages/ui/Navbar.tsx` | Fixed position, gradient background + backdrop blur. Logo + links (Discover, Watchlist, History, Profile) with active state (yellow-400). Includes RegionPicker. `hidden md:block`. |
| **elloloop/easyloops** | `src/shared/components/Navigation.tsx` | Desktop nav (`hidden md:flex`). Links: Courses, Problems, About, Vision, Mission, Help. Active state highlighting. |
| **elloloop/easyloops** | `src/shared/components/Header.tsx` | Full header with Logo, nav, LanguageSelector, ThemeToggle, AuthButton. |
| **elloloop/learnloop** | `components/nav/AppHeader.tsx` | Top header with Brain logo, user avatar, role badge (color-coded), sign-out button. |
| **elloloop/featuredocs** | `src/components/Header.tsx` | Logo link + nav links (Products, Admin). Border-bottom, cream background. |
| **elloloop/tell-a-tale** | `src/shared/components/Header.tsx` | Brand link (handwriting font) + 3 nav links. White background + shadow. |
| **tinykite/star-trib** | `apps/web/src/northern-star/NavBar/NavBar.tsx` | Logo (next/image), site title, 8 horizontal nav links with `toSlug()` utility. `hidden md:flex`. |

## Acceptance Criteria

- [ ] Fixed/sticky top position with configurable background (solid, gradient, blur)
- [ ] Logo slot (image or text)
- [ ] Nav links with active state detection (via pathname)
- [ ] Right-side action slot (for ThemeToggle, AuthButton, etc.)
- [ ] Hidden on mobile (`hidden md:flex`) — pairs with BottomNav
- [ ] Backdrop blur option for transparent/glass effect
- [ ] Responsive breakpoint configurable
- [ ] Keyboard accessible navigation
- [ ] ARIA: `<nav>` landmark, `aria-current="page"` on active link
- [ ] Unit tests + Storybook stories

## API

```tsx
<Navbar
  logo={<Logo />}
  links={[
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ]}
  actions={<ThemeToggle />}
  variant="blur"  // "solid" | "blur" | "gradient"
/>
```
