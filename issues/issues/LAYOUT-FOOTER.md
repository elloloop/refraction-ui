---
id: LAYOUT-FOOTER
track: layout
depends_on: ["PKG-CORE"]
size: S
labels: [feat]
status: pending
---

## Summary

Build Footer component — bottom section with copyright, social links, and optional nav columns.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/footer` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-footer` | React wrapper | React component with hooks binding |
| `@elloloop/angular-footer` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-footer` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/tell-a-tale** | `src/shared/components/Footer.tsx` | Centered copyright (dynamic year) + social links (Twitter, GitHub). Top border. |
| **elloloop/featuredocs** | `src/app/layout.tsx` | Simple footer with copyright text in root layout. |
| **elloloop/easyloops** | `src/app/page.tsx` | Landing page footer section (inline, not extracted). |

## Acceptance Criteria

- [ ] Copyright text with dynamic year
- [ ] Social links slot (Twitter/X, GitHub, LinkedIn, etc.)
- [ ] Optional nav link columns (Products, Resources, Company, etc.)
- [ ] Responsive: stacked on mobile, columns on desktop
- [ ] Top border or background separator
- [ ] Custom className support
- [ ] Unit tests + Storybook stories
