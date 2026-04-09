---
id: THEME-TOGGLE
track: theme
depends_on: ["THEME-PROVIDER"]
size: S
labels: [feat, a11y]
status: pending
---

## Summary

Build ThemeToggle component — a 3-way switcher for light/dark/system modes with SVG icons.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/theme-toggle` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-theme-toggle` | React wrapper | React component with hooks binding |
| `@elloloop/angular-theme-toggle` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-theme-toggle` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Implementation |
|---------|------|----------------|
| **elloloop/easyloops** | `src/shared/components/ThemeToggle.tsx` | Dropdown theme picker with Light (sun icon), Dark (moon icon), System (monitor icon). Custom dropdown with checkmark on selected. |
| **elloloop/learnloop** | `components/ThemeToggle.tsx` | Three-mode radio group (Light/Dark/System) with inline SVG icons. Responsive: shows labels only on `sm+`. |

## Acceptance Criteria

- [ ] Renders 3 options: Light (sun), Dark (moon), System (monitor)
- [ ] Uses `useTheme()` hook from ThemeProvider
- [ ] Visual indicator on the active selection (checkmark or highlight)
- [ ] Dropdown variant (easyloops-style) and inline variant (learnloop-style)
- [ ] Responsive: icon-only on mobile, icon+label on desktop
- [ ] Keyboard accessible (arrow keys, Enter, Escape)
- [ ] ARIA: proper role, aria-label, aria-checked
- [ ] Icons are inline SVG (no external icon dependency required)
- [ ] Supports custom className for styling overrides
- [ ] Unit tests + Storybook story
- [ ] Bundle size < 1KB gzipped

## Variants

1. **Dropdown** — Click to open, pick from menu (easyloops pattern)
2. **Segmented** — Inline 3-segment toggle (learnloop pattern)
