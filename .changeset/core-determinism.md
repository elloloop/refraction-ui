---
'@refraction-ui/react': patch
'@refraction-ui/astro': patch
---

- **Core determinism**: headless cores no longer hard-depend on ambient time/randomness — each now accepts an optional, injectable clock/rng at its config seam (defaults stay ambient, so existing usage is unchanged):
  - **Conversation**: `now?: () => Date` for conversation/message timestamps.
  - **Calendar** / **DatePicker**: `today?: Date` reference date — fixes SSR/CSR hydration mismatch when server and client render on different days (also drives time-default fallbacks in DatePicker).
  - **Toast**: `now?: () => number` for timer pause/resume math and manager `createdAt` stamps.
  - **Analytics**: `now?: () => Date` (default event `timestamp`, HTTP-sink `sentAt`) and `random?: () => number` (sample-rate decisions); per-call `timestamp` override still wins.
  - **Logger**: `now?: () => number` (record timestamps, span timing) and `random?: () => number` (sampling).
  - **Footer**: `year?: number` for the default copyright text — fixes year-boundary SSR/CSR mismatch.
- **Calendar**: ARIA prop returns are now typed `Record<string, string | number | boolean>` (spread-safe), with `aria-current` omitted rather than `undefined` on non-today cells.
