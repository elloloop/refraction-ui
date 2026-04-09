---
id: FORM-VERSION-SELECTOR
track: forms
depends_on: ["PKG-CORE"]
size: S
labels: [feat]
status: pending
---

## Summary

Build VersionSelector — dropdown for switching between product/app versions with "latest" badge.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/version-selector` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-version-selector` | React wrapper | React component with hooks binding |
| `@elloloop/angular-version-selector` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-version-selector` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/featuredocs** | `src/components/VersionSelector.tsx` | Dropdown `<select>` for version switching. Navigates via `next/navigation` router on change. Labels the latest version. Client component. |

## Acceptance Criteria

- [ ] Dropdown showing version list
- [ ] "Latest" badge/label on current version
- [ ] `onVersionChange(version)` callback
- [ ] Optional: navigate to URL on change (Next.js router integration)
- [ ] Sorted by version (newest first)
- [ ] Custom className support
- [ ] Unit tests + Storybook story
