---
id: FORM-INLINE-EDITOR
track: forms
depends_on: ["COMP-BUTTON", "COMP-TEXTAREA", "PKG-CORE"]
size: M
labels: [feat]
status: pending
---

## Summary

Build InlineEditor — inline markdown editor with toolbar, side-by-side preview, and save/cancel flow.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/inline-editor` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-inline-editor` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-inline-editor` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-inline-editor` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/featuredocs** | `src/components/FeatureDocContent.tsx` | "Edit" button toggles editor. Toolbar: Bold, Heading, List, Link, Video. Commit-message input. Side-by-side markdown + live preview. Save/Cancel buttons. |
| **elloloop/featuredocs** | `src/components/InlineEditor.tsx` | Near-identical to FeatureDocContent — same toolbar, editor/preview, save/cancel. |

## Acceptance Criteria

- [ ] Toggle between view mode and edit mode
- [ ] Edit mode: toolbar + markdown textarea + live preview (side-by-side)
- [ ] Toolbar buttons: Bold, Heading, List, Link, custom actions
- [ ] Toolbar inserts markdown syntax at cursor position
- [ ] Optional commit message input (for versioned content)
- [ ] Save and Cancel buttons
- [ ] `onSave(content, commitMessage?)` callback
- [ ] Preview renders markdown to HTML
- [ ] Responsive: stacked on mobile, side-by-side on desktop
- [ ] Keyboard shortcuts: Ctrl+B (bold), Ctrl+S (save)
- [ ] Unit tests + Storybook stories
