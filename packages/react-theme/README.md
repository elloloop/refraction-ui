# @elloloop/react-theme

Theme provider and utilities for React. Part of [Refraction UI](https://elloloop.github.io/refraction-ui/).

## Install

```bash
pnpm add @elloloop/react-theme
```

## Usage

```tsx
import { ThemeProvider, useTheme } from '@elloloop/react-theme'

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <YourApp />
    </ThemeProvider>
  )
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle</button>
}
```

## Exports

ThemeProvider, useTheme, ThemeToggle, ThemeScript

## License

MIT
