# @refraction-ui/react

All Refraction UI React components in one package — headless, accessible, zero-dependency.

```bash
npm install @refraction-ui/react
```

```tsx
import { Button, Card, Dialog } from '@refraction-ui/react'
import { ThemeProvider } from '@refraction-ui/react/theme'
```

React Hook Form-backed primitives are opt-in so the root package does not force
every consumer to install `react-hook-form`:

```tsx
import { Form, FormField, useForm } from '@refraction-ui/react/form'
```

## Default theme stylesheet

Refraction components are headless: they read CSS custom properties for color, typography, layout, and motion. To get a complete working theme out of the box (the Linear/Vercel-inspired "Refraction" palette), import the bundled stylesheet once at your app entry point:

```ts
import '@refraction-ui/react/styles.css'
```

The stylesheet is **opt-in**. If you already define your own tokens (or use `@refraction-ui/tailwind-config`'s preset), don't import it — every component will continue to work with your tokens.

### Overriding tokens

Redeclare any variable after the import:

```css
:root {
  --primary: 280 70% 50%;
  --radius: 0.5rem;
}
```

### Dark mode

Dark tokens activate automatically when `.dark` is applied to the root element (the default `ThemeProvider` mode), or when `[data-theme="dark"]` is set (the `attribute: 'data-theme'` mode). Either configuration works without extra setup.

## Smaller bundles

Install individual packages for smaller bundles:

```bash
npm install @refraction-ui/react-button
```
