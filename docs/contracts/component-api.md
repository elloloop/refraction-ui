# Component API Conventions

## General
- Named exports, no default export.
- Headless primitives with minimal styling. Styled wrappers optional.
- Props follow Radix naming where possible (open, onOpenChange, etc).

## Data attributes
- Use `data-state="open|closed|active|inactive"`.
- Use `data-disabled="true"` when disabled.

## Variants
- Styled wrappers use class-variance-authority style variant objects.
- Never hardcode colors. Pull from CSS vars.

## Testing and docs
- Each component ships tests, a story, and MDX docs.
- Axe checks pass for stories.

## Canonical prop types

Common TypeScript interfaces for all core components live in
`docs/contracts/component-props.ts`. These interfaces include accessibility
attributes, theming hooks, event handlers and composition helpers. Components
should extend these base contracts so that controlled and uncontrolled usage,
ref forwarding and responsive design patterns are consistent across the
library.
