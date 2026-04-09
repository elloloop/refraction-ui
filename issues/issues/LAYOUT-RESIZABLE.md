---
id: LAYOUT-RESIZABLE
track: layout
depends_on: ["PKG-CORE"]
size: M
labels: [feat]
status: pending
---

## Summary

Build ResizableLayout and DraggableDivider — CSS-variable-driven resizable pane system for IDE-like layouts.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/resizable-layout` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-resizable-layout` | React wrapper | React component with hooks binding |
| `@elloloop/angular-resizable-layout` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-resizable-layout` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/shared/components/MainLayout.tsx` | Two-pane resizable layout (left: problem, right: editor). CSS variables for pane sizing. Stacks vertically on mobile. |
| **elloloop/easyloops** | `src/shared/components/DraggableDivider.tsx` | Thin draggable divider bar. `horizontal` (col-resize) and `vertical` (row-resize) orientations. |
| **elloloop/easyloops** | `src/shared/hooks/useResizableLayout.ts` | CSS-variable-driven drag resizing. Horizontal + vertical. Persists layout to localStorage. Constrained min/max bounds. |
| **elloloop/auteur.one** | `frontend/app/page.tsx` | Two drag handles: vertical (col-resize between properties/canvas) and horizontal (row-resize between canvas/timeline). Default/min/max constraints. |

## Acceptance Criteria

- [ ] `<ResizableLayout>` wraps panes with configurable orientation (horizontal/vertical)
- [ ] `<DraggableDivider>` renders thin drag handle between panes
- [ ] CSS variables control pane sizes (not inline styles on panes)
- [ ] Min/max constraints per pane
- [ ] Default sizes configurable
- [ ] Persists layout to localStorage (optional, configurable key)
- [ ] Stacks vertically on mobile breakpoint
- [ ] Cursor changes during drag (`col-resize` / `row-resize`)
- [ ] `useResizableLayout()` hook for custom implementations
- [ ] Keyboard accessible (arrow keys to resize)
- [ ] Unit tests + Storybook stories

## API

```tsx
<ResizableLayout
  orientation="horizontal"
  defaultSizes={[320, "1fr"]}
  minSizes={[250, 400]}
  maxSizes={[600, "80vh"]}
  persistKey="editor-layout"
>
  <ResizableLayout.Pane>Left</ResizableLayout.Pane>
  <ResizableLayout.Divider />
  <ResizableLayout.Pane>Right</ResizableLayout.Pane>
</ResizableLayout>
```
