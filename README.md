# Refraction UI

Per-component headless UI library. 123 packages. Zero external runtime dependencies.

## Quick Start

```bash
# Install just what you need
pnpm add @refraction-ui/react-button @refraction-ui/react-dialog @refraction-ui/react-theme

# Or install everything
pnpm add @refraction-ui/react
```

## Features

- **Headless core** -- pure TypeScript, framework-agnostic
- **React wrappers** -- thin adapters with proper types
- **Per-component packages** -- install only what you need
- **Full brand theming** -- CSS variables control every visual detail
- **Accessible** -- WCAG AA, colorblind-safe, keyboard navigable
- **Zero external runtime deps** -- we implement everything ourselves

## Documentation

- [Component Docs](https://elloloop.github.io/refraction-ui/)
- [Theme Editor](https://elloloop.github.io/refraction-ui/theme/editor)
- [Example Websites](https://elloloop.github.io/refraction-ui/examples)

## Packages

### Core UI

| Package | Install |
|---------|---------|
| Button | `pnpm add @refraction-ui/react-button` |
| Input | `pnpm add @refraction-ui/react-input` |
| Textarea | `pnpm add @refraction-ui/react-textarea` |
| Checkbox | `pnpm add @refraction-ui/react-checkbox` |
| Switch | `pnpm add @refraction-ui/react-switch` |
| Select | `pnpm add @refraction-ui/react-select` |
| Dialog | `pnpm add @refraction-ui/react-dialog` |
| Popover | `pnpm add @refraction-ui/react-popover` |
| Tooltip | `pnpm add @refraction-ui/react-tooltip` |
| Toast | `pnpm add @refraction-ui/react-toast` |
| Dropdown Menu | `pnpm add @refraction-ui/react-dropdown-menu` |
| Tabs | `pnpm add @refraction-ui/react-tabs` |
| Card | `pnpm add @refraction-ui/react-card` |
| Badge | `pnpm add @refraction-ui/react-badge` |
| Avatar | `pnpm add @refraction-ui/react-avatar` |
| Skeleton | `pnpm add @refraction-ui/react-skeleton` |
| Calendar | `pnpm add @refraction-ui/react-calendar` |
| Date Picker | `pnpm add @refraction-ui/react-date-picker` |
| Data Table | `pnpm add @refraction-ui/react-data-table` |
| Command | `pnpm add @refraction-ui/react-command` |

### Layout and Navigation

| Package | Install |
|---------|---------|
| App Shell | `pnpm add @refraction-ui/react-app-shell` |
| Navbar | `pnpm add @refraction-ui/react-navbar` |
| Sidebar | `pnpm add @refraction-ui/react-sidebar` |
| Breadcrumbs | `pnpm add @refraction-ui/react-breadcrumbs` |
| Footer | `pnpm add @refraction-ui/react-footer` |
| Bottom Nav | `pnpm add @refraction-ui/react-bottom-nav` |
| Mobile Nav | `pnpm add @refraction-ui/react-mobile-nav` |

### Advanced

| Package | Install |
|---------|---------|
| Rich Editor | `pnpm add @refraction-ui/react-rich-editor` |
| Code Editor | `pnpm add @refraction-ui/react-code-editor` |
| Charts | `pnpm add @refraction-ui/react-charts` |
| File Upload | `pnpm add @refraction-ui/react-file-upload` |
| Video Player | `pnpm add @refraction-ui/react-video-player` |
| Auth | `pnpm add @refraction-ui/react-auth` |

### Infrastructure

| Package | Install |
|---------|---------|
| Theme | `pnpm add @refraction-ui/react-theme` |
| Shared Utilities | `pnpm add @refraction-ui/shared` |
| Tailwind Config | `pnpm add @refraction-ui/tailwind-config` |
| Tokens Core | `pnpm add @refraction-ui/tokens-core` |
| CLI | `pnpm add -D @refraction-ui/cli` |

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

## CLI

```bash
# Bootstrap a new project with theme CSS and Tailwind config
npx @refraction-ui/cli init

# Show install command for a component
npx @refraction-ui/cli add button
```

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
