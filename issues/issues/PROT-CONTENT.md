---
id: PROT-CONTENT
track: protection
depends_on: ["PKG-CORE"]
size: S
labels: [feat]
status: pending
---

## Summary

Build ContentProtection — anti-copy wrapper with context menu prevention, copy interception, zero-width character noise, and watermark overlay.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/content-protection` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-content-protection` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-content-protection` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-content-protection` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/shared/components/ContentProtection.tsx` | Disables context menu, intercepts copy/cut, injects zero-width character noise into DOM text, adds repeating SVG watermark overlay (configurable text, e.g., "easyloops.app"). |

## Acceptance Criteria

- [ ] `<ContentProtection>` wraps protected content
- [ ] Disables right-click context menu on wrapped content
- [ ] Intercepts Ctrl+C/Cmd+C copy events
- [ ] Injects zero-width characters into DOM text (prevents clean copy)
- [ ] Repeating SVG watermark overlay (configurable text, opacity, angle)
- [ ] `watermarkText`, `enabled`, `disableCopy`, `disableContextMenu` props
- [ ] No visual impact on normal reading (watermark is subtle)
- [ ] Can be disabled via prop (e.g., for authenticated/paid users)
- [ ] Unit tests + Storybook stories
