---
"@refraction-ui/react": minor
---

**Breaking change:** `ThemeProvider`, `ThemeToggle`, `useTheme`, `ThemeScript`, and theme types are no longer exported from the main entry of `@refraction-ui/react`. They've moved to an opt-in subpath so they don't clash with consumers' existing theme systems (e.g. `next-themes`).

Migration:

```diff
- import { ThemeProvider, useTheme } from '@refraction-ui/react'
+ import { ThemeProvider, useTheme } from '@refraction-ui/react/theme'
```

`@refraction-ui/react-theme` is unaffected — if you import directly from there, no change is needed.

(This is technically a breaking change but is being shipped as a `minor` per `0.x` semver convention.)
