---
id: COMP-TOOLTIP
track: components
depends_on: ["COMP-API-CONTRACT", "THEME-RUNTIME"]
size: S
labels: [feat, a11y]
---

## Summary

Build Tooltip primitive and styled wrapper

## Acceptance Criteria

- [ ] Tooltip component renders as floating text with trigger
- [ ] Tooltip supports controlled and uncontrolled open state
- [ ] Tooltip has proper keyboard navigation (Escape to close)
- [ ] Tooltip supports proper ARIA attributes (role="tooltip", aria-describedby, etc.)
- [ ] Tooltip supports custom positioning (top, bottom, left, right, auto)
- [ ] Tooltip supports custom alignment (start, center, end)
- [ ] Tooltip supports custom offset and padding
- [ ] Tooltip supports hover to show (configurable delay)
- [ ] Tooltip supports focus to show (configurable)
- [ ] Tooltip supports click to show (configurable)
- [ ] Tooltip has proper z-index management
- [ ] Tooltip supports animation and transition effects
- [ ] Tooltip supports responsive design (mobile-friendly)
- [ ] Tooltip supports theme customization via CSS custom properties
- [ ] Tooltip supports custom trigger elements
- [ ] Tooltip supports proper event handling (onOpenChange, onPointerEnter, etc.)
- [ ] Tooltip supports ref forwarding
- [ ] Tooltip has proper screen reader support
- [ ] Tooltip supports arrow indicator pointing to trigger
- [ ] Tooltip supports rich content (text, HTML, components)
- [ ] Tooltip supports custom styling and theming
- [ ] Unit tests with 90%+ coverage
- [ ] Storybook stories for all variants and states
- [ ] Axe accessibility tests with 0 violations
- [ ] Bundle size <3KB (gzipped)
- [ ] Performance: shows in <50ms

## Tasks

- [ ] Create Tooltip primitive component with proper TypeScript types
- [ ] Implement styled wrapper with theme integration
- [ ] Add positioning and alignment logic
- [ ] Implement trigger interaction handling
- [ ] Add arrow indicator support
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

## Tooltip Positions

- **top**: Above trigger (default)
- **bottom**: Below trigger
- **left**: Left of trigger
- **right**: Right of trigger
- **auto**: Automatic positioning based on available space

## Tooltip Triggers

- **hover**: Shows on hover (default)
- **focus**: Shows on focus
- **click**: Shows on click
- **manual**: Controlled by parent component

## Tooltip Delays

- **fast**: 100ms delay
- **normal**: 300ms delay (default)
- **slow**: 500ms delay
- **none**: No delay

## Notes

- Follow React best practices for component design
- Ensure proper semantic HTML and accessibility
- Support for both controlled and uncontrolled usage
- Consider performance implications of positioning calculations
- Include proper error boundaries and error handling
- Support for SSR and hydration
