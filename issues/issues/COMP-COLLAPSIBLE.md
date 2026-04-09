---
id: COMP-COLLAPSIBLE
track: components
depends_on: ["COMP-API-CONTRACT"]
size: S
labels: [feat, a11y]
status: pending
---

## Summary

Build CollapsibleSection — expandable/collapsible panel with icon, title, and chevron toggle.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/collapsible` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-collapsible` | React wrapper | React component with hooks binding |
| `@elloloop/angular-collapsible` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-collapsible` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/shared/components/CollapsibleSection.tsx` | Props: `title`, `children`, `defaultExpanded`, `icon`, `className`. Chevron rotates on expand/collapse. |

## Acceptance Criteria

- [ ] Header with optional icon, title text, and chevron indicator
- [ ] Click header to toggle content visibility
- [ ] `defaultExpanded` prop for initial state
- [ ] Controlled mode via `expanded` + `onToggle` props
- [ ] Smooth height animation on expand/collapse
- [ ] Chevron rotates 90° or 180° on toggle
- [ ] ARIA: `aria-expanded`, `aria-controls`, `role="button"` on trigger
- [ ] Content hidden from accessibility tree when collapsed
- [ ] Supports nested collapsibles
- [ ] Unit tests + Storybook stories
