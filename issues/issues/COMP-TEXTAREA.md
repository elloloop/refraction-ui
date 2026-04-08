---
id: COMP-TEXTAREA
track: components
depends_on: ["COMP-API-CONTRACT", "THEME-RUNTIME"]
size: S
labels: [feat, a11y]
status: pending
---

## Summary

Build Textarea primitive — auto-sizing textarea with consistent styling tokens.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/textarea` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-textarea` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-textarea` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-textarea` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/stream-mind** | `frontend/src/components/ui/textarea.tsx` | Auto-sizing textarea with `field-sizing-content`. Built on `@base-ui/react/input`. Supports aria-invalid, disabled, dark mode. Same styling tokens as Input. |

## Acceptance Criteria

- [ ] Renders as `<textarea>` element
- [ ] Auto-sizing via `field-sizing: content` (with JS fallback)
- [ ] Consistent styling with Input component (border, focus ring, disabled)
- [ ] Supports `rows`, `maxRows` props
- [ ] Supports `aria-invalid` for error states
- [ ] Supports disabled and readonly states
- [ ] Theme customization via CSS custom properties
- [ ] Ref forwarding
- [ ] Unit tests + Storybook stories
- [ ] Bundle size < 2KB gzipped
