---
id: COMP-INPUT
track: components
depends_on: ["COMP-API-CONTRACT", "THEME-RUNTIME"]
size: M
labels: [feat, a11y]
---

## Summary

Build Input (text/password) primitive and styled wrapper

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@elloloop/input` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@elloloop/react-input` | React wrapper | React component with hooks binding |
| `@elloloop/angular-input` | Angular wrapper | Angular standalone component |
| `@elloloop/astro-input` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Implementation |
|---------|------|----------------|
| **elloloop/stream-mind** | `frontend/src/components/ui/input.tsx` | Styled text input built on `@base-ui/react/input`. Supports aria-invalid, disabled, dark mode. |
| **elloloop/learnloop** | `app/globals.css` | `.input` CSS component class with focus ring and dark mode variant. |
| **elloloop/learnloop** | `components/Auth.tsx` | Inline email/password inputs with validation. |
| **elloloop/easyloops** | Various inline | Raw `<input>` with Tailwind classes, no extracted component. |

**Recommended base**: stream-mind version (@base-ui/react) — proper headless primitive with accessibility built-in.

## Acceptance Criteria

- [ ] Input component renders as `<input>` element by default
- [ ] Input supports all standard input types (text, password, email, number, etc.)
- [ ] Input supports controlled and uncontrolled value state
- [ ] Input supports proper form integration (name, required, validation)
- [ ] Input supports placeholder text with proper styling
- [ ] Input supports label with proper association (for/id)
- [ ] Input supports helper text and error messages
- [ ] Input supports left and right addons (icons, text, buttons)
- [ ] Input supports clear button functionality
- [ ] Input supports loading state with spinner
- [ ] Input supports disabled and read-only states
- [ ] Input supports multiple sizes (sm, md, lg)
- [ ] Input supports proper focus states and keyboard navigation
- [ ] Input supports proper ARIA attributes (aria-describedby, aria-invalid, etc.)
- [ ] Input supports validation states (valid, invalid, warning)
- [ ] Input supports character count and max length
- [ ] Input supports auto-complete and auto-fill
- [ ] Input supports proper event handling (onChange, onFocus, onBlur, etc.)
- [ ] Input supports ref forwarding
- [ ] Input has consistent styling across all browsers
- [ ] Input supports theme customization via CSS custom properties
- [ ] Input supports responsive design patterns
- [ ] Input supports proper screen reader support
- [ ] Unit tests with 90%+ coverage
- [ ] Storybook stories for all variants and states
- [ ] Axe accessibility tests with 0 violations
- [ ] Bundle size <4KB (gzipped)
- [ ] Performance: renders in <16ms

## Tasks

- [ ] Create Input primitive component with proper TypeScript types
- [ ] Implement styled wrapper with theme integration
- [ ] Add label and helper text support
- [ ] Implement addon support (left/right)
- [ ] Add validation state handling
- [ ] Implement clear button functionality
- [ ] Add loading state support
- [ ] Implement accessibility features (ARIA, screen reader support)
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

## Input Types

- **text**: Standard text input (default)
- **password**: Password input with toggle visibility
- **email**: Email input with validation
- **number**: Number input with step controls
- **tel**: Telephone input with formatting
- **url**: URL input with validation
- **search**: Search input with clear button
- **date**: Date picker input
- **time**: Time picker input

## Input Sizes

- **sm**: 32px height, small text
- **md**: 40px height, normal text (default)
- **lg**: 48px height, larger text

## Input States

- **default**: Normal state
- **focus**: Active focus state
- **hover**: Hover state
- **disabled**: Disabled state
- **readonly**: Read-only state
- **error**: Error state with validation message
- **warning**: Warning state with validation message
- **success**: Success state with validation message

## Notes

- Follow React best practices for component design
- Ensure proper semantic HTML and accessibility
- Support for both controlled and uncontrolled usage
- Consider performance implications of validation
- Include proper error boundaries and error handling
- Support for form libraries (React Hook Form, Formik, etc.)
