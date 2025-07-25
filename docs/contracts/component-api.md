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
