---
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

fix(react,astro): route hardcoded status colors through theme tokens

Status-semantic variants in the shared headless cores now use the semantic
token utilities instead of fixed Tailwind palette classes, so they follow
the active theme's CSS variables in both frameworks:

- **Toast** — `success`/`error`/`warning` use the `success`/`destructive`/
  `warning` tokens (dropping the per-mode `dark:` overrides; the variables
  flip per mode). Astro's programmatic `showToast` variant map matches.
- **Callout** — `info` uses the new `info` token (`bg-info/10`,
  `border-info/20`, `text-info`).
- **StatusIndicator** — dot/pulse `success`/`error`/`warning`/`info` use
  the matching tokens (`pending`/`neutral` keep their fixed orange/gray —
  no tokens exist for them).
- **ProgressDisplay** stat cards — `success`/`warning` tints use tokens.
- **PresenceIndicator** / **AvatarGroup** presence dots — online→`success`,
  away→`warning`, busy/dnd→`destructive` (`offline` stays gray).
- **EmptyState** icon chip — `success`/`warning` tones use tokens.
- **Input** — `valid` state uses `border-success`/`ring-success`, and the
  React valid-state check icon uses `text-success`.

Rendered hues shift slightly from the old fixed palette values, matching
the earlier Badge/Callout `success`/`warning` token change.
