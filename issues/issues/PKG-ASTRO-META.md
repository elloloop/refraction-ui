---
id: PKG-ASTRO-META
track: frameworks
depends_on: ["PKG-CORE"]
size: M
labels: [feat, infra]
status: pending
---

## Summary

Create `@refraction-ui/astro` meta-package and the Astro wrapper infrastructure. Astro components are server-rendered by default — the headless core computes ARIA attributes and CSS classes at build time. Interactive components use Astro's `client:load` / `client:visible` islands with React or vanilla JS underneath.

## Source References

- **tinykite/astro-blog-test** — Astro 4 project (AstroPaper template) in tinykite org
- **tinykite/vegetables-are-cool** — Astro 3 project

## Astro Component Patterns

### Static components (no JS shipped to client)
```astro
---
// @refraction-ui/astro-badge
import { getBadgeClasses, getBadgeAriaProps } from '@refraction-ui/badge'

interface Props {
  variant?: 'default' | 'primary' | 'destructive' | 'success'
  size?: 'sm' | 'md'
}

const { variant = 'default', size = 'md' } = Astro.props
const classes = getBadgeClasses({ variant, size })
const ariaProps = getBadgeAriaProps({ variant })
---
<span class={classes} {...ariaProps}>
  <slot />
</span>
```

### Interactive components (islands architecture)
```astro
---
// @refraction-ui/astro-dialog
// Uses React island for interactivity
import { DialogReact } from '@refraction-ui/react-dialog'
---
<DialogReact client:load {...Astro.props}>
  <slot />
</DialogReact>
```

### Hybrid components (server-rendered with progressive enhancement)
```astro
---
// @refraction-ui/astro-theme
// Server renders with default, hydrates for system preference detection
import { ThemeScript, ThemeToggleReact } from '@refraction-ui/react-theme'
---
<ThemeScript />  <!-- inline script for flash prevention, no framework needed -->
<ThemeToggleReact client:load />  <!-- hydrates for interaction -->
```

## Component Classification

| Type | Examples | Client JS? |
|------|---------|------------|
| **Static** | Badge, Skeleton, DeviceFrame, Footer, Breadcrumbs | None (0KB) |
| **Progressive** | Button, Collapsible, Navbar | Minimal (click handlers only) |
| **Interactive** | Dialog, Command, DropdownMenu, Toast, Tabs, Calendar | React/Vue island |
| **Complex** | Theme, Auth, SearchBar, CodeEditor, VideoPlayer | Full island |

## Acceptance Criteria

- [ ] Astro wrapper template/generator for new components
- [ ] Static components: zero client JS, server-rendered HTML + CSS
- [ ] Interactive components: use `client:load` or `client:visible` islands
- [ ] Hybrid components: server-render structure, hydrate interaction
- [ ] `@refraction-ui/astro` meta-package re-exports all wrappers
- [ ] At least Badge (static), Button (progressive), Dialog (interactive), Theme (hybrid) as proof-of-concept
- [ ] Astro integration for `astro add @refraction-ui/astro`
- [ ] Works with Astro 4+
- [ ] Documentation showing island patterns
