---
id: COMP-TOAST
track: components
depends_on: ["COMP-API-CONTRACT", "THEME-RUNTIME"]
size: M
labels: [feat, a11y]
---

## Summary

Build Toast primitive and styled wrapper

## Acceptance Criteria

- [ ] Toast component renders as notification with proper positioning
- [ ] Toast supports multiple variants (success, error, warning, info)
- [ ] Toast supports custom duration and auto-dismiss
- [ ] Toast supports manual dismiss with close button
- [ ] Toast supports proper ARIA attributes (role="alert", aria-live, etc.)
- [ ] Toast supports custom positioning (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
- [ ] Toast supports custom content (title, description, actions)
- [ ] Toast supports icons for different variants
- [ ] Toast supports progress indicator for auto-dismiss
- [ ] Toast supports pause on hover functionality
- [ ] Toast has proper z-index management
- [ ] Toast supports animation and transition effects
- [ ] Toast supports responsive design (mobile-friendly)
- [ ] Toast supports theme customization via CSS custom properties
- [ ] Toast supports proper event handling (onDismiss, onAction, etc.)
- [ ] Toast supports ref forwarding
- [ ] Toast has proper screen reader support
- [ ] Toast supports multiple toasts (stacking)
- [ ] Toast supports custom styling and theming
- [ ] Toast supports accessibility features (keyboard navigation, focus management)
- [ ] Unit tests with 90%+ coverage
- [ ] Storybook stories for all variants and states
- [ ] Axe accessibility tests with 0 violations
- [ ] Bundle size <5KB (gzipped)
- [ ] Performance: renders in <50ms

## Tasks

- [ ] Create Toast primitive component with proper TypeScript types
- [ ] Implement styled wrapper with theme integration
- [ ] Add positioning and stacking logic
- [ ] Implement auto-dismiss and pause functionality
- [ ] Add progress indicator support
- [ ] Implement accessibility features (ARIA, screen reader support)
- [ ] Add animation and transition support
- [ ] Implement responsive design patterns
- [ ] Add theme integration with CSS custom properties
- [ ] Create comprehensive unit tests
- [ ] Write Storybook stories for all variants
- [ ] Add accessibility tests with Axe
- [ ] Implement performance optimizations
- [ ] Add bundle size analysis
- [ ] Create documentation and examples

## Technical Requirements

- **Framework**: React with TypeScript
- **Styling**: CSS custom properties with theme integration
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized rendering and minimal re-renders
- **Testing**: Unit, integration, and accessibility tests
- **Documentation**: Storybook stories and JSDoc comments

## Toast Variants

- **success**: Green styling with checkmark icon
- **error**: Red styling with error icon
- **warning**: Yellow styling with warning icon
- **info**: Blue styling with info icon

## Toast Positions

- **top-right**: Top right corner (default)
- **top-left**: Top left corner
- **bottom-right**: Bottom right corner
- **bottom-left**: Bottom left corner
- **top-center**: Top center
- **bottom-center**: Bottom center

## Toast Durations

- **short**: 3000ms (default)
- **medium**: 5000ms
- **long**: 10000ms
- **persistent**: No auto-dismiss

## Notes

- Follow React best practices for component design
- Ensure proper semantic HTML and accessibility
- Support for both controlled and uncontrolled usage
- Consider performance implications of multiple toasts
- Include proper error boundaries and error handling
- Support for SSR and hydration
