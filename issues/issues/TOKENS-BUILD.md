---
id: TOKENS-BUILD
track: tokens
depends_on: ["TOKENS-SCHEMA"]
size: M
labels: [feat]
---

## Summary

Build CSS vars and Tailwind fragment from tokens

## Acceptance Criteria

- [ ] `refraction tokens build` command generates `tokens.css` with CSS custom properties
- [ ] `refraction tokens build --tailwind` generates Tailwind config fragment
- [ ] Token references are resolved (e.g., `{color.primary}` → `var(--color-primary)`)
- [ ] Nested token structures are flattened to CSS custom properties
- [ ] Theme and mode switching is supported via CSS classes
- [ ] Generated CSS follows naming convention: `--{category}-{name}`
- [ ] Tailwind fragment includes color, spacing, typography, and component tokens
- [ ] Build process handles invalid token references gracefully
- [ ] Unit tests cover token resolution, CSS generation, and Tailwind fragment generation
- [ ] Integration tests verify CSS output works in browser environment
- [ ] Performance: Build completes in <2s for typical token files (<1000 tokens)
- [ ] Memory usage: <100MB for large token files (>5000 tokens)

## Tasks

- [ ] Implement token resolver with reference resolution
- [ ] Create CSS custom property generator
- [ ] Build Tailwind config fragment generator
- [ ] Add CLI command integration
- [ ] Write comprehensive unit tests
- [ ] Add integration tests with sample token files
- [ ] Implement error handling for invalid references
- [ ] Add performance benchmarks
- [ ] Create documentation for token syntax and build process

## Technical Requirements

- **Input**: JSON token files following established schema
- **Output**: CSS file with custom properties and optional Tailwind fragment
- **Reference Resolution**: Support for `{token.path}` syntax
- **Theme Support**: Generate CSS for multiple themes and modes
- **Error Handling**: Clear error messages for invalid tokens
- **Performance**: Optimized for large token files
- **Testing**: 90%+ test coverage

## Notes

- Follows ADR-0001 for JSON tokens and CSS vars approach
- Must be compatible with existing token schema
- Consider caching for large token files
- Support for custom naming conventions via config
