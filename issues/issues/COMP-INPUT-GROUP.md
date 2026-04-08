---
id: COMP-INPUT-GROUP
track: components
depends_on: ["COMP-INPUT", "COMP-TEXTAREA"]
size: M
labels: [feat, a11y]
status: pending
---

## Summary

Build InputGroup — composite input wrapper supporting inline/block addons (icons, buttons, text) around Input or Textarea.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/input-group` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-input-group` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-input-group` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-input-group` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/stream-mind** | `frontend/src/components/ui/input-group.tsx` | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`. CVA-based alignment variants. Supports inline/block addons. |

## Acceptance Criteria

- [ ] `<InputGroup>` wraps Input/Textarea with optional addons
- [ ] `<InputGroupAddon>` for icons or decorative elements
- [ ] `<InputGroupButton>` for action buttons (e.g., search, clear)
- [ ] `<InputGroupText>` for text labels (e.g., "$", "https://")
- [ ] Addons can be placed left or right (or both)
- [ ] Inline and block alignment variants via CVA
- [ ] Proper border radius handling (rounded on outer edges only)
- [ ] Focus state propagates visually to the group
- [ ] ARIA: addons are decorative or properly labeled
- [ ] Unit tests + Storybook stories
