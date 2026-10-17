---
'@refraction-ui/react': minor
---

Add `HighlightText` to `@refraction-ui/react`: renders `text` with the parts matching `query` (a phrase or an array of terms) or explicit `ranges` wrapped in `<mark>`, case- and diacritic-insensitive by default with `caseSensitive`, `diacriticSensitive` and `wholeWord` options. The pure `getHighlightSegments`, `findHighlightRanges`, `mergeHighlightRanges` and `splitHighlightQuery` helpers are exported too, with offsets that always point into the original string. (#584)
