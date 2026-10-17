---
'@refraction-ui/react': minor
---

Add `GifPicker` to `@refraction-ui/react`: a provider-agnostic GIF grid with Popular / Recent / Yours tabs and debounced search (`debounceMs`). Pass `results` (`{ id, previewUrl, animatedUrl, width, height, alt, title?, badge? }`), `status` and an `onSearch(query, tab)` / `onLoadMore` loader; it renders lazy, aspect-preserving images (stills under reduced motion), per-item badges, empty / loading / error states, an `attribution` slot, and arrow-key grid navigation with `onSelect`. (#581)
