---
id: LAYOUT-SIDEBAR
track: layout
depends_on: ["PKG-CORE"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build Sidebar — desktop side navigation with role-based sections, icons, and active state. Hidden on mobile.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/sidebar` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-sidebar` | React wrapper | React component with hooks binding |
| `@elloloop/angular-sidebar` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-sidebar` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/learnloop** | `components/nav/Sidebar.tsx` | Desktop sidebar (`hidden md:flex`). Dynamically builds nav items based on user roles (student, parent, admin, reviewer). Lucide icons, active-state highlighting. |
| **elloloop/learnloop** | `components/nav/ParentNav.tsx` | Parent-specific sidebar with Dashboard/Children/Progress/Settings links, plus colored avatar links for each child. |

## Acceptance Criteria

- [ ] Vertical sidebar with icon + label nav items
- [ ] Active state highlighting (background + accent color)
- [ ] Sections/groups support (e.g., "Main", "Settings")
- [ ] Role-based item filtering (items can specify required roles)
- [ ] Collapsible to icon-only mode
- [ ] Hidden on mobile (`hidden md:flex`)
- [ ] Supports nested items (one level)
- [ ] Custom slot items (e.g., child avatars from ParentNav)
- [ ] ARIA: `<nav>`, proper roles, keyboard navigation
- [ ] Unit tests + Storybook stories
