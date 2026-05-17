---
"@refraction-ui/react-charts": minor
"@refraction-ui/react-select": minor
---

feat: dev-only `devWarn` on the silent-default-context footgun (epic #254 Wave 1, #256 Batch 1B)

`react-charts` sub-charts (`Bars`/`Line`/`Circles`) and `react-select` compound parts (`SelectTrigger`/`SelectContent`/`SelectItem`) previously fell back to a context default with **no error and no signal** when used outside `<Chart>` / `<Select>` (the worst footgun tier per `docs/instrumentation/policy.md`). They now emit a warn-once `devWarn` from `@refraction-ui/shared` at the context-consumption seam.

Non-breaking by design: no throw is introduced (would be a breaking change for a silent-default context), runtime behaviour is unchanged, and the `devWarn` is env-guarded so it is stripped/silent in production.
