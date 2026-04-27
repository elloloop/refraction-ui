---
"@refraction-ui/react": minor
---

Ship TypeScript declaration files (`.d.ts` / `.d.cts`).

Previously the meta package was published with `dts: false` because of historical export-name conflicts. Those conflicts have already been resolved via renamed re-exports (`progressBarVariants` / `optionVariants` / `STATUS_COLORS` / `STATUS_LABELS` / etc.), so DTS generation has now been enabled. Consumers using `@refraction-ui/react` no longer need a manual ambient shim and will get full IntelliSense and type-checking.
