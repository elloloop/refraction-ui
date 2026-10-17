---
'@refraction-ui/react': minor
---

Add `MarkupText` to `@refraction-ui/react`: renders `**bold**` runs and `{token}` placeholders from an `inline` node map, or (with `mode="message"`) mention chips from structured `mentions` ranges, safe auto-linked URLs (`rel="noopener noreferrer nofollow"`, no `javascript:`/`data:` links) and inline code, all as React nodes. The pure `parseMarkupText` parser is exported alongside it. (#567)
