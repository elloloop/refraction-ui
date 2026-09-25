---
'@refraction-ui/react': minor
'@refraction-ui/astro': minor
---

Add four app-surface components:

- `PageHeader` — heading cluster for an application page: `kicker`, `title`, `description`, trailing `actions`, `as` (`h1`–`h3`). App-sized, never centred (use `SectionHead` for marketing sections).
- `ActionList` + `ActionListItem` — a vertical list whose rows are each one keyboard-reachable action (a full-width native button with `title`, `description`, `meta`, `trailing`, `density`, `disabled`).
- `LineChart` — responsive multi-series line chart on one shared y-scale with gridlines, category labels, hover/keyboard crosshair + tooltip, legend and optional area fill; series colours default to the `--chart-N` tokens.
- `FunnelChart` — stepped conversion funnel with each step's share of the top step, continue-rate and drop-off, all copy and number formatting overridable.
