---
id: THEME-RUNTIME
track: tokens
depends_on: ["TOKENS-BUILD"]
size: S
labels: [feat]
---

## Summary

ThemeProvider and useTheme hook

## Acceptance Criteria

- [ ] `ThemeProvider` component wraps app and provides theme context
- [ ] `useTheme` hook returns current theme, mode, and theme switching functions
- [ ] Theme switching happens without visual flash or layout shift
- [ ] Theme selection persists across browser sessions (localStorage)
- [ ] Theme selection persists across page refreshes
- [ ] Support for system theme detection and auto-switching
- [ ] Support for multiple themes (light, dark, custom themes)
- [ ] Support for multiple modes within themes (default, high-contrast, etc.)
- [ ] Theme switching is accessible via keyboard navigation
- [ ] Theme context includes theme metadata (name, description, author)
- [ ] Theme context provides CSS custom property values
- [ ] Theme context supports dynamic theme loading
- [ ] Performance: Theme switching completes in <100ms
- [ ] Memory: Theme context uses <1MB memory overhead
- [ ] Unit tests with 90%+ coverage
- [ ] Integration tests verify theme persistence and switching

## Tasks

- [ ] Create ThemeProvider component with React Context
- [ ] Implement useTheme hook with theme switching logic
- [ ] Add localStorage persistence for theme selection
- [ ] Implement system theme detection
- [ ] Add CSS custom property injection for theme values
- [ ] Create theme switching utilities
- [ ] Add accessibility support for theme switching
- [ ] Implement dynamic theme loading
- [ ] Write comprehensive unit tests
- [ ] Add integration tests
- [ ] Create documentation and examples

## Technical Requirements

- **Context API**: React Context for theme state management
- **Persistence**: localStorage with fallback to sessionStorage
- **System Detection**: matchMedia API for system theme detection
- **Performance**: Optimized re-renders and CSS injection
- **Accessibility**: Keyboard navigation and screen reader support
- **TypeScript**: Full type safety for theme context and hooks
- **Testing**: Unit and integration test coverage

## Theme Context Interface

```typescript
interface ThemeContext {
  theme: string;
  mode: string;
  themes: Theme[];
  switchTheme: (theme: string) => void;
  switchMode: (mode: string) => void;
  toggleTheme: () => void;
  isSystem: boolean;
  setSystemTheme: (enabled: boolean) => void;
}
```

## Notes

- Follow React best practices for context usage
- Consider performance implications of theme switching
- Support for SSR and hydration
- Ensure theme switching is accessible
- Consider supporting theme transitions and animations
