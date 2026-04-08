---
id: UTILS-CORE
track: utils
depends_on: ["PKG-REACT"]
size: L
labels: [feat]
status: pending
---

## Summary

Build the complete utilities library — union of all utility functions across all elloloop and tinykite projects. Framework-agnostic, pure functions.

## Source References

### Class Merging
| Utility | Source | Description |
|---------|--------|-------------|
| `cn()` | **stream-mind** `frontend/src/lib/utils.ts`, **tell-a-tale** `src/shared/lib/utils.ts`, **one-mission** `src/shared/lib/utils.ts`, **easyloops** (implicit) | Tailwind class merge: `clsx` + `tailwind-merge`. Identical across 4+ projects. |

### URL / String Utilities
| Utility | Source | Description |
|---------|--------|-------------|
| `slugify(title, id)` | **stream-mind** `frontend/src/lib/slugify.ts` | URL slug generation from title + numeric ID. |
| `parseIdFromSlug(slug)` | **stream-mind** `frontend/src/lib/slugify.ts` | Extract numeric ID from slug. |
| `toSlug(str)` | **star-trib** `NavBar.tsx` | Convert display name to URL slug (replaces `&` with "and", strips special chars). |
| `formatQuestionName(id)` | **easyloops** `src/shared/lib/formatters.ts` | Convert `01-variable-declaration` to `Variable Declaration`. |
| `normalizeOutput(text)` | **easyloops** `src/shared/lib/formatters.ts` | Trim whitespace, normalize `\r\n` to `\n`. |
| `formatDate(iso)` | **featuredocs** `AdminFeedbackTable.tsx` | ISO string to "MMM DD, YYYY". |
| `generateShortCode(slug)` | **easyloops** `src/shared/lib/shortCodes.ts` | Deterministic 4-char short codes from slug hashes. |

### Caching
| Utility | Source | Description |
|---------|--------|-------------|
| `getCached(key, ttlMs)` | **stream-mind** `frontend/src/lib/cache.ts` | localStorage cache with TTL expiry. |
| `setCache(key, data)` | **stream-mind** `frontend/src/lib/cache.ts` | Set cached data with timestamp. |

### Device / Identity
| Utility | Source | Description |
|---------|--------|-------------|
| `getDeviceId()` | **stream-mind** `frontend/src/lib/identity.ts` | UUID in localStorage. |
| `getDeviceCode()` | **stream-mind** `frontend/src/lib/identity.ts` | 8-char code derived from device ID. |
| `haptic(ms)` | **stream-mind** `frontend/src/lib/identity.ts` | `navigator.vibrate` wrapper. |
| `isTauriApp()` | **easyloops** `src/shared/lib/isTauri.ts` | Detect Tauri desktop environment. |

### Sync / Offline
| Utility | Source | Description |
|---------|--------|-------------|
| `queueSync()` | **stream-mind** `frontend/src/lib/sync.ts` | Offline-first sync layer. Queues changes, debounces (2s), flushes to server. |
| `flushSync()` | **stream-mind** `frontend/src/lib/sync.ts` | Immediate flush of queued changes. |

### Logging
| Utility | Source | Description |
|---------|--------|-------------|
| `logger` | **auteur.one** `frontend/lib/logger.ts` | 5 levels (DEBUG-FATAL), 8 categories, session tracking, ring buffer, scoped loggers, `measurePerformance()`. |
| `logger` (simple) | **tell-a-tale** `src/shared/lib/logger.ts` | Dev-only `log`, `error`, `info` with `[StoryEditor]` prefix. |

### Errors
| Utility | Source | Description |
|---------|--------|-------------|
| Error hierarchy | **auteur.one** `frontend/lib/errors.ts` | 7 classes: AppError, AudioError, ExportError, FileError, ValidationError, NetworkError, StateError. Factory methods, recoverability flags, user-friendly messages. |

### Validation
| Utility | Source | Description |
|---------|--------|-------------|
| `sanitizeString()` | **auteur.one** `frontend/lib/validation.ts` | Removes `<>`, `javascript:`, `on*=` event handlers. |
| `validateFile()` | **auteur.one** `frontend/lib/validation.ts` | Checks type, size, name length. |

### Data Accessors
| Utility | Source | Description |
|---------|--------|-------------|
| `callAccessor(accessor, d, i)` | **next-d3** `src/lib/chart.tsx` | If function, call it; otherwise return value. |
| `combineChartDimensions(dims)` | **next-d3** `src/lib/chart.tsx` | Merge partial dimensions with defaults, compute bounded. |
| `randomAroundMean({mean, deviation})` | **next-d3** `src/lib/math.tsx` | Box-Muller normal distribution random numbers. |

### Locale / Region
| Utility | Source | Description |
|---------|--------|-------------|
| `getLocalizedValue()` | **featuredocs** `FeatureCard.tsx` | Resolve localized string with fallback chain. Duplicated in 3 files. |
| `getStoredLocale()` | **featuredocs** `LocaleSwitcher.tsx` | Read locale from localStorage. |

## Acceptance Criteria

- [ ] All utilities exported from `@refraction-ui/react/utils`
- [ ] Each utility independently importable (tree-shakeable)
- [ ] `cn()` — single canonical implementation
- [ ] URL utilities: `slugify`, `parseIdFromSlug`, `toSlug`, `generateShortCode`
- [ ] Format utilities: `formatDate`, `formatQuestionName`, `normalizeOutput`
- [ ] Cache utilities: `getCached`, `setCache` with TTL
- [ ] Device utilities: `getDeviceId`, `getDeviceCode`, `haptic`, `isTauriApp`
- [ ] Sync utilities: `queueSync`, `flushSync` (offline-first)
- [ ] Logger: structured, scoped, 5 levels, 8 categories, ring buffer
- [ ] Error classes: typed hierarchy with factory methods
- [ ] Validation: `sanitizeString`, `validateFile`
- [ ] Data: `callAccessor`, `combineChartDimensions`, `randomAroundMean`
- [ ] Locale: `getLocalizedValue`, `getStoredLocale`
- [ ] Zero framework dependencies (pure functions, except sync which uses DOM events)
- [ ] Unit tests for every utility
- [ ] JSDoc comments with examples

## Package Location

```
packages/react/src/utils/
  cn.ts
  slugify.ts
  format.ts
  cache.ts
  identity.ts
  sync.ts
  logger.ts
  errors.ts
  validation.ts
  call-accessor.ts
  locale.ts
  short-codes.ts
  index.ts
```
