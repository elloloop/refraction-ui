---
'@refraction-ui/react': patch
'@refraction-ui/astro': patch
---

Docs + Storybook follow-up to the API ergonomics fixes:

- **Button** — new `PrimaryAlias` story + dedicated docs section showing `variant="primary"` renders identically to `variant="default"`. Variants table updated.
- **StatusIndicator** — fixed broken docs example (was passing `status=` instead of the real prop `type=`). Added `WithChildren` and `DotOnly` stories + new docs sections for the children-fallback and dot-only patterns. Props table now lists `children` and `pulse`'s pending-default behaviour.
- **Theme** — Storybook stories expanded to three doc cards (Overview / `defaultMode` / Resolution Order). New `/theme/api` docs page documents `ThemeProvider`, `ThemeScript`, and `useTheme` together with the full SSR-safe setup pattern (mirrors `defaultMode` between head script and provider).

No runtime/source changes — pure docs + Storybook.
