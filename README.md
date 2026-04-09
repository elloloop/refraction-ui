# Refraction UI

Per-component headless UI library. 123 packages. Zero external runtime dependencies.

## Quick Start

```bash
# Install just what you need
pnpm add @elloloop/react-button @elloloop/react-dialog @elloloop/react-theme

# Or install everything
pnpm add @elloloop/react
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
| Button | `pnpm add @elloloop/react-button` |
| Input | `pnpm add @elloloop/react-input` |
| Textarea | `pnpm add @elloloop/react-textarea` |
| Checkbox | `pnpm add @elloloop/react-checkbox` |
| Switch | `pnpm add @elloloop/react-switch` |
| Select | `pnpm add @elloloop/react-select` |
| Dialog | `pnpm add @elloloop/react-dialog` |
| Popover | `pnpm add @elloloop/react-popover` |
| Tooltip | `pnpm add @elloloop/react-tooltip` |
| Toast | `pnpm add @elloloop/react-toast` |
| Dropdown Menu | `pnpm add @elloloop/react-dropdown-menu` |
| Tabs | `pnpm add @elloloop/react-tabs` |
| Card | `pnpm add @elloloop/react-card` |
| Badge | `pnpm add @elloloop/react-badge` |
| Avatar | `pnpm add @elloloop/react-avatar` |
| Skeleton | `pnpm add @elloloop/react-skeleton` |
| Calendar | `pnpm add @elloloop/react-calendar` |
| Date Picker | `pnpm add @elloloop/react-date-picker` |
| Data Table | `pnpm add @elloloop/react-data-table` |
| Command | `pnpm add @elloloop/react-command` |

### Layout and Navigation

| Package | Install |
|---------|---------|
| App Shell | `pnpm add @elloloop/react-app-shell` |
| Navbar | `pnpm add @elloloop/react-navbar` |
| Sidebar | `pnpm add @elloloop/react-sidebar` |
| Breadcrumbs | `pnpm add @elloloop/react-breadcrumbs` |
| Footer | `pnpm add @elloloop/react-footer` |
| Bottom Nav | `pnpm add @elloloop/react-bottom-nav` |
| Mobile Nav | `pnpm add @elloloop/react-mobile-nav` |

### Advanced

| Package | Install |
|---------|---------|
| Rich Editor | `pnpm add @elloloop/react-rich-editor` |
| Code Editor | `pnpm add @elloloop/react-code-editor` |
| Charts | `pnpm add @elloloop/react-charts` |
| File Upload | `pnpm add @elloloop/react-file-upload` |
| Video Player | `pnpm add @elloloop/react-video-player` |
| Auth | `pnpm add @elloloop/react-auth` |

### Infrastructure

| Package | Install |
|---------|---------|
| Theme | `pnpm add @elloloop/react-theme` |
| Shared Utilities | `pnpm add @elloloop/shared` |
| Tailwind Config | `pnpm add @elloloop/tailwind-config` |
| Tokens Core | `pnpm add @elloloop/tokens-core` |
| CLI | `pnpm add -D @elloloop/cli` |

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
npx @elloloop/cli init

# Show install command for a component
npx @elloloop/cli add button
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
