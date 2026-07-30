# @refraction-ui/tailwind-config

## 0.2.2

### Patch Changes

- c7d825f: Add `pending` (orange) and `neutral` (gray) status tokens end-to-end (vars in all themes + light/dark, preset utilities), and route status-indicator pending/neutral, presence-indicator offline, and avatar-group offline through them (offline now shares the neutral token). Completes the status token set — no status colors remain hardcoded.

## 0.2.1

### Patch Changes

- 5cfcf9d: feat(tailwind-config): add `info`/`info-foreground` color utilities to the preset

  Maps `info` to the new `--info`/`--info-foreground` CSS variables (mirroring
  the `success`/`warning` nested pattern), so `bg-info`, `text-info`,
  `border-info`, `bg-info/10`, … follow the active theme. The variables are
  defined in the default stylesheet and in every bundled theme (all 6, light
  and dark): light uses `217 91% 60%` (#3B82F6, Tailwind blue-500 —
  pixel-identical to the previously hardcoded `blue-500` info styles); dark
  lightens to `217 91% 65%` to keep contrast sensible on dark surfaces. The
  Flutter package's info token remains #2196F3 (Material blue) — a deliberate
  small cross-framework delta.

## 0.2.0

### Minor Changes

- cdd92bc: Add `success`/`success-foreground` and `warning`/`warning-foreground` color utilities to the preset (mapped to the existing `--success`/`--warning` CSS variables), and make `borderRadius.sm` a fixed `2px` absolute instead of `calc(var(--radius) - 4px)` so small elements (e.g. checkboxes) no longer collapse toward a circle at large `--radius` values. The default theme (`--radius: 0.375rem`) renders pixel-identical `sm` radius as before.

## 0.1.7

### Patch Changes

- 01c7f71: Fix VoicePill and Waveform docs behavior, add inline VoicePill placement and Waveform amplitude control, smooth generated waveform animation, and patch audited dependency versions.

## 0.1.5

### Patch Changes

- 6319dc8: Trigger full publish cycle to synchronize npm latest tag

## 0.1.4

### Patch Changes

- 83cf3d8: fix: resolve core styling, layout, and typography bugs

  - Fixed `app-shell`, `auth-shell`, and `page-shell` factories where `undefined` config values incorrectly overwrote default settings.
  - Added `@tailwindcss/typography` plugin to the `refractionPreset` to ensure proper markdown styling.
  - Upgraded the documentation site's code blocks to use `shiki` for proper syntax highlighting.

## 0.1.3

### Patch Changes

- dabcbd6: chore: force release to update latest npm tags

## 0.1.2

### Patch Changes

- c083c7d: docs: update readme to reflect supported and planned frameworks and trigger a final release test

## 0.1.1

### Patch Changes

- 30d38ee: chore: test new changesets + oidc release workflow
