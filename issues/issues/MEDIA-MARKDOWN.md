---
id: MEDIA-MARKDOWN
track: media
depends_on: ["PKG-CORE"]
size: M
labels: [feat]
status: pending
---

## Summary

Build MarkdownRenderer — rich markdown renderer supporting embedded components, video directives, wiki links, and code playgrounds.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/markdown-renderer` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-markdown-renderer` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-markdown-renderer` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-markdown-renderer` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/shared/components/MarkdownRenderer.tsx` | Uses `marked`. Supports embedded `PythonPlayground` (python code blocks), `CopyPromptBox`, `LoopyGrid`, `[[wiki:slug]]` and `[[question:slug]]` link syntax. Validates slugs against known lists. |
| **elloloop/featuredocs** | `src/components/MarkdownRenderer.tsx` | Server-rendered HTML with video placeholders. Splits at `<div class="video-embed">` markers and replaces with VideoPlayer components. |
| **elloloop/featuredocs** | `src/lib/markdown.ts` | Processes `::video[filename]{attrs}` directives, renders via `marked` (GFM mode). |

## Acceptance Criteria

- [ ] Renders markdown to HTML via `marked` (GFM mode)
- [ ] Custom directive support (e.g., `::video[file]{attrs}`)
- [ ] Component embedding: register custom block types that render React components
- [ ] Wiki link syntax: `[[wiki:slug]]`, `[[question:slug]]` with custom resolver
- [ ] Code block enhancement: syntax highlighting, optional "Try it" playground
- [ ] Video placeholder replacement with VideoPlayer components
- [ ] Prose typography styling (headings, lists, code, blockquotes, tables)
- [ ] XSS-safe: sanitize HTML output
- [ ] `onLinkClick` callback for custom link handling
- [ ] Unit tests + Storybook stories

## Dependencies

- `marked` (peer)
