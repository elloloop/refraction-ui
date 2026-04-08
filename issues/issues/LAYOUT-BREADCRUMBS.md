---
id: LAYOUT-BREADCRUMBS
track: layout
depends_on: ["PKG-CORE"]
size: S
labels: [feat, a11y]
status: pending
---

## Summary

Build Breadcrumbs — auto-generated breadcrumb navigation from the current pathname.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/breadcrumbs` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-breadcrumbs` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-breadcrumbs` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-breadcrumbs` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/learnloop** | `components/nav/Breadcrumbs.tsx` | Auto-generated from `usePathname()`. Maps URL segments to labels with de-kebab capitalization. Separator between items. |
| **elloloop/featuredocs** | `src/app/[product]/[locale]/[feature]/[version]/page.tsx` | Inline breadcrumb with product > locale > feature > version links. |

## Acceptance Criteria

- [ ] Auto-generates from current pathname (`usePathname()`)
- [ ] Converts kebab-case segments to Title Case labels
- [ ] Custom label overrides via `labels` prop or map
- [ ] Separator character configurable (default `/` or `>`)
- [ ] Last item is not a link (current page)
- [ ] Truncates long paths with ellipsis (configurable max items)
- [ ] ARIA: `<nav aria-label="Breadcrumb">`, `<ol>`, `aria-current="page"` on last
- [ ] Unit tests + Storybook stories
