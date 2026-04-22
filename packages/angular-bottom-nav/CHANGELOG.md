# @refraction-ui/angular-bottom-nav

## 0.1.0

### Minor Changes

- Initial release of `angular-bottom-nav` component.
  - `BottomNavComponent` (`re-bottom-nav`) wrapping the headless `@refraction-ui/bottom-nav` core.
  - Supports `tabs` (NavTab[]) and `currentPath` inputs for active-state detection.
  - Reactive state via Angular signals; CSS classes via `bottomNavVariants` / `bottomNavTabVariants`.
  - Mobile-only visibility (`md:hidden`) via the headless style variants.
