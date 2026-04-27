---
"@refraction-ui/react": minor
---

Ship a default `styles.css` bundle for opt-in consumers.

`@refraction-ui/react` is fully headless — every component reads CSS custom properties from `:root`. Consumers who didn't already define ~18 tokens (background, foreground, primary, border, radius, shadows, etc.) had to set them up before components looked right.

You can now opt in with a single import:

```ts
import '@refraction-ui/react/styles.css'
```

This stylesheet defines 177 tokens grouped by colors, charts, sidebar, shape, typography, shadows, glass/overlay, spacing, layout, borders, behavior, selection, and motion — sourced from the canonical `refractionTheme` (formerly `glassaTheme`) at `packages/tailwind-config/src/themes/glassa.ts`. Dark mode covers both `.dark` and `[data-theme="dark"]` selectors so it works regardless of how `ThemeProvider` is configured.

The import is fully opt-in — consumers who already define their own tokens (e.g. via Tailwind config or app `globals.css`) should not import it and will see no change in behavior. Override any individual token by redefining it in your own stylesheet after this one.
