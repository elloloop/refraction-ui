---
'@refraction-ui/react': minor
---

Add `LinkPreview` to `@refraction-ui/react`: an unfurled link card under a message, built from caller-supplied metadata (`url`, `siteName`, `siteIcon`, `title`, `description`, `image`) in `full` and `compact` variants. The card is one `rel="noopener noreferrer nofollow"` link named "title, site", only absolute http(s) URLs render, the image loads lazily into a fixed aspect box, and `onDismiss` adds a remove button beside the link. (#573)
