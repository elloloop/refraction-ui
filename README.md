# Refraction UI

A headless core UI library with framework-specific wrappers. Zero external runtime dependencies.

## Supported Frameworks

- **React** (`@refraction-ui/react`) - ✅ Fully Supported
- **Astro** (`@refraction-ui/astro`) - ✅ Fully Supported
- **Angular** (`@refraction-ui/angular`) - 🚧 *Planned / Work in Progress*

## Community Help Wanted

We'd love to see Refraction UI support the following frameworks! If you're interested in building the wrappers for these, please open an issue or PR:
- **Svelte** (`@refraction-ui/svelte`)
- **Solid** (`@refraction-ui/solid`)

## Components

**Core UI**
- ✅ Accordion, Avatar, Badge, Button, Calendar, Card, Charts, Checkbox, Code Editor, Collapsible, Command, Data Table, Date Picker, Dialog, Dropdown Menu, Input, Popover, Radio, Resizable Layout, Rich Editor, Select, Skeleton, Slide Viewer, Switch, Tabs, Textarea, Toast, Tooltip.
- 🚧 *Planned:* Carousel, Context Menu, Hover Card, Menubar, Navigation Menu, Scroll Area, Slider.

**Layout & Navigation**
- ✅ App Shell, Bottom Nav, Breadcrumbs, Footer, Mobile Nav, Navbar, Sidebar.
- 🚧 *Planned:* Pagination, Stepper.

**Advanced & Utilities**
- ✅ Auth, Content Protection, Diff Viewer, Emoji Picker, Feedback Dialog, File Upload, I18n, Inline Editor, Install Prompt, Keyboard Shortcut, Language Selector, Markdown Renderer, Presence Indicator, Progress Display, Reaction Bar, Search Bar, Status Indicator, Theme, Thread View, Version Selector, Video Player.

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
