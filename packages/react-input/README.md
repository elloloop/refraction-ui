# @refraction-ui/react-input

A headless, accessible, styled `<Input>` component for React.

```tsx
import { Input } from '@refraction-ui/react-input'

export function Example() {
  return <Input type="email" placeholder="you@example.com" />
}
```

## Sizing

The `<Input>` component exposes a `size` prop that controls its **visual**
size (`'sm' | 'default' | 'lg'`). This deliberately shadows the native HTML
`<input size>` attribute, which is a number controlling the visible
character width of the input.

We made this trade-off because:

- The native `size` attribute is rarely used in modern web apps.
- Visual sizing (small / default / large) is needed in nearly every form.
- Shadowing it via `Omit<InputHTMLAttributes, 'size'>` lets us keep the
  shorter, more ergonomic name without breaking TypeScript.

```tsx
// Visual size variants
<Input size="sm" placeholder="Small" />
<Input size="default" placeholder="Default" />
<Input size="lg" placeholder="Large" />

// If you genuinely need the native character-width attribute,
// drop down to a plain <input> or set it imperatively via a ref.
function NativeSize() {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.size = 20 // native character-width
  }, [])
  return <Input ref={ref} size="default" />
}
```

> Heads up: if you previously relied on passing the native numeric `size`
> attribute directly to `<Input>`, TypeScript will now reject it. This is
> intentional — see above.
