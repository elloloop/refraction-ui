---
"@refraction-ui/react": patch
---

Fix: 0.23.0's ESM entry imported the unpublished `@refraction-ui/shared` (for the new `cn`/`cva` root exports), so importing `@refraction-ui/react` failed to resolve. The ESM split build now bundles every workspace package the entry re-exports and refuses to emit any `@refraction-ui/*` import.
