# Refraction UI

A headless core UI library with framework-specific wrappers. Zero external runtime dependencies.

## Supported Frameworks

- **React** (`@refraction-ui/react`) - ✅ Fully Supported
- **Astro** (`@refraction-ui/astro`) - ✅ Fully Supported
- **Angular** (`@refraction-ui/angular`) - 🚧 *Planned / Work in Progress*
- **Vue** (`@refraction-ui/vue`) - 🚧 *Planned / Work in Progress*
- **Svelte** (`@refraction-ui/svelte`) - 🚧 *Planned / Work in Progress*
- **Solid** (`@refraction-ui/solid`) - 🚧 *Planned / Work in Progress*

## Quick Start

```bash
# Install the library for your framework of choice
npm install @refraction-ui/react
# or
npm install @refraction-ui/astro
```

## Features

- **Headless core** -- pure TypeScript, framework-agnostic
- **Framework wrappers** -- thin adapters with proper types for React, Astro, and more
- **Full brand theming** -- CSS variables control every visual detail
- **Accessible** -- WCAG AA, colorblind-safe, keyboard navigable
- **Zero external runtime deps** -- we implement everything ourselves

## Documentation

- [Component Docs](https://elloloop.github.io/refraction-ui/)
- [Theme Editor](https://elloloop.github.io/refraction-ui/theme/editor)
- [Example Websites](https://elloloop.github.io/refraction-ui/examples)

## Theming

### Simple (colors + fonts)

```css
:root {
  --primary: 250 50% 50%;
  --font-sans: 'Inter', sans-serif;
  --radius: 0.375rem;
}
```

### Advanced (full brand control)

See [Theme Reference](https://elloloop.github.io/refraction-ui/theme/reference)

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Typecheck
pnpm typecheck
```

## License

MIT
