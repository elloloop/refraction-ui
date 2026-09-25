---
'@refraction-ui/react': patch
---

- `cn` and `cva` are now exported from `@refraction-ui/react` (the meta's docs already said so).
- `Button asChild` no longer forces `type="button"` onto a non-button child such as a link.
- `TabsTrigger` sets `aria-controls` only when its panel is actually rendered (the selected tab with a `TabsContent`), instead of pointing at missing elements.
