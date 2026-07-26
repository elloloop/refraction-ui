---
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

Wire previously missing component packages into the framework metas so they actually reach consumers:

- Both metas: wire in `location-selector` (devDependency + re-export) for the first time — `LocationSelector` is now available from `@refraction-ui/react` and `@refraction-ui/astro`.
- `@refraction-ui/react`: re-export `react-ai` (`AIProvider`/`useAI`/`TTSProvider`/`useTTS`) and `react-charts` (`Chart`/`Bars`/`Line`/`Circles`/`XAxis`/`YAxis`/`Gradient`/`Histogram`/`ScatterPlot`/`PieChart`/`ChartContext`), removing the stale "stubs with no exports yet" comment.
- `@refraction-ui/react`: re-export `react-command-input` — its `CommandInput`/`CommandInputProps` clash with `react-command`'s compound palette input (which keeps the stable public name), so the standalone trigger-detection input is exposed as `StandaloneCommandInput`/`StandaloneCommandInputProps`.
- `@refraction-ui/react`: re-export `react-diff-viewer` (`DiffViewer` and its headless API); its `sidebarVariants`/`sidebarItemVariants` clash with `react-sidebar`, so they are exposed as `diffViewerSidebarVariants`/`diffViewerSidebarItemVariants` following the established alias pattern.

Also includes two patch fixes affecting `@refraction-ui/react`:

- fix command-input trigger detection after whitespace (broken `\s` regex in the core)
- fix ThemeToggle conditional hook calls when variant changes
