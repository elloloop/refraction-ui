---
id: THEME-PROVIDER
track: theme
depends_on: ["PKG-CORE", "THEME-RUNTIME"]
size: M
labels: [feat]
status: pending
---

## Summary

Build ThemeProvider component with light/dark/system mode support, CSS variable injection, and hydration-safe persistence. Consolidates 3 independent theme implementations.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/theme` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-theme` | React wrapper | React component with hooks binding |
| `@elloloop/angular-theme` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-theme` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Implementation |
|---------|------|----------------|
| **elloloop/easyloops** | `src/features/editor/hooks/useTheme.ts` | Full custom: `useThemeState` manages localStorage, applies `dark`/`light` class to `<html>` and `<body>`, sets CSS custom properties (`--background`, `--foreground`), listens for system `prefers-color-scheme` changes. Hydration-safe. |
| **elloloop/easyloops** | `src/shared/components/ThemeProvider.tsx` | React context provider wrapping `ThemeContext.Provider` with `useThemeState()`. |
| **elloloop/learnloop** | `components/ThemeProvider.tsx` | Wraps `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`. |
| **elloloop/learnloop** | `app/layout.tsx` | `<html suppressHydrationWarning>` for theme flash prevention; dual `themeColor` meta tags. |
| **elloloop/stream-mind** | `frontend/src/app/globals.css` | oklch CSS custom properties for dark theme. |
| **elloloop/one-mission** | `src/app/globals.css` | HSL CSS variables with both light and dark mode (slate base). |
| **elloloop/tell-a-tale** | `src/app/globals.css` | HSL CSS variables (light only, but `darkMode: ["class"]` configured). |

## Acceptance Criteria

- [ ] `<ThemeProvider>` wraps app and provides theme context
- [ ] Supports three modes: `light`, `dark`, `system`
- [ ] `system` mode tracks `prefers-color-scheme` media query changes in real-time
- [ ] Applies `dark` or `light` class to `<html>` element
- [ ] Injects CSS custom properties for the active theme
- [ ] Persists theme choice in localStorage
- [ ] Hydration-safe: no flash of wrong theme on SSR/SSG
- [ ] `suppressHydrationWarning` on `<html>` for Next.js compatibility
- [ ] Supports `themeColor` meta tag updates for mobile browsers
- [ ] Works with both Tailwind `darkMode: 'class'` (v3) and v4 CSS-first
- [ ] Zero dependencies beyond React (no next-themes required)
- [ ] `<ThemeProvider defaultTheme="system" storageKey="refraction-theme">`
- [ ] Unit tests for all modes, persistence, system detection
- [ ] Bundle size < 2KB gzipped

## API

```tsx
<ThemeProvider
  defaultTheme="system"       // "light" | "dark" | "system"
  storageKey="refraction-theme"
  attribute="class"           // "class" | "data-theme"
  enableSystem={true}
>
  {children}
</ThemeProvider>
```

## Notes

- The easyloops implementation is the most complete custom version (no external deps)
- The learnloop implementation uses next-themes which adds a dependency
- Prefer the custom approach (easyloops-style) to avoid the next-themes dependency
- Must handle the Next.js SSR hydration flash issue (script injection pattern)
