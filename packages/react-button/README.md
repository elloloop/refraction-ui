# @refraction-ui/react-button

Button component for React. Part of [Refraction UI](https://elloloop.github.io/refraction-ui/).

## Install

```bash
pnpm add @refraction-ui/react-button
```

## Usage

```tsx
import { Button } from '@refraction-ui/react-button'

<Button variant="primary" size="md">Click me</Button>
```

## Variants

default, destructive, outline, secondary, ghost, link

## Sizes

xs, sm, default, lg, icon, icon-sm, icon-xs

## Touch targets

The icon sizes are 28–36px. Pass `touchTarget` to grow the clickable area to at
least 44×44 CSS px (WCAG 2.5.5) without changing how the button looks or the
space it takes. It is off by default. Keep neighbouring targets' centres at
least 44px apart.

```tsx
<Button size="icon-sm" touchTarget aria-label="Star">
  <StarIcon />
</Button>
```

## License

MIT
