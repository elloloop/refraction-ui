---
'@refraction-ui/react': minor
---

Add `FileCard` to `@refraction-ui/react`: an attachment card with a kind icon from the MIME type or extension, a middle-truncated name that keeps the extension, size, duration and pixel size, and `uploading` (progress bar, `onCancel`), `failed` (`error`, `onRetry`) and `done` (`onDownload`, `actions`) states; it opens as a `<button>` (`onOpen`) or a link (`href`). The pure helpers `formatFileCardBytes`, `formatFileCardDuration`, `formatFileCardDimensions`, `truncateFileCardName` and `resolveFileCardKind` are exported too. (#577)
