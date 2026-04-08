---
id: MEDIA-CODE-EDITOR
track: media
depends_on: ["PKG-CORE"]
size: M
labels: [feat]
status: pending
---

## Summary

Build CodeEditor — Monaco Editor wrapper with theme integration, language support, and resize handling.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/code-editor` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-code-editor` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-code-editor` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-code-editor` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/features/editor/components/MonacoEditor.tsx` | Monaco loaded from CDN. Handles init, value/language/theme updates, ResizeObserver for container changes, cleanup. |
| **elloloop/easyloops** | `src/features/editor/components/CodeEditor.tsx` | Wrapper with header bar (Run and Evaluate buttons), wraps MonacoEditor. Responsive button labels. |
| **elloloop/easyloops** | `src/shared/components/PythonPlayground.tsx` | Inline Python runner using Pyodide (WASM). Collapsed "Try it!" preview, expandable Monaco editor, run/reset/close buttons, auto-resize. |

## Acceptance Criteria

- [ ] `<CodeEditor>` wraps Monaco Editor
- [ ] Loads Monaco from CDN (no bundling)
- [ ] Language support: Python, Go, JavaScript, TypeScript, C, C++, Java, Rust, JSON, YAML, Markdown
- [ ] Theme integration: syncs with refraction-ui theme (light/dark)
- [ ] ResizeObserver for container-based resize
- [ ] Value, language, and theme updates without remounting
- [ ] Optional header bar with action buttons (Run, Reset, Copy)
- [ ] `<PythonPlayground>` — collapsed preview, expandable editor with Pyodide run
- [ ] `onChange(value)`, `onRun(value)` callbacks
- [ ] Read-only mode
- [ ] Proper cleanup on unmount
- [ ] Unit tests + Storybook stories
