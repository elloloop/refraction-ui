---
id: CLI-TOKENS
track: cli
depends_on: ["TOKENS-SCHEMA", "TOKENS-BUILD"]
size: S
labels: [feat]
---

## Summary

tokens import/build commands

## Acceptance Criteria

- [ ] `refraction tokens build` builds CSS from token files
- [ ] `refraction tokens build --watch` watches for changes and rebuilds
- [ ] `refraction tokens build --output` specifies custom output directory
- [ ] `refraction tokens build --format` supports CSS, SCSS, and Tailwind output
- [ ] `refraction tokens validate` validates token files against schema
- [ ] `refraction tokens validate --strict` fails on schema violations
- [ ] `refraction tokens watch` starts file watcher for development
- [ ] `refraction tokens --config` uses custom configuration file
- [ ] Command validates token schema before building
- [ ] Command resolves token references correctly
- [ ] Command generates CSS custom properties
- [ ] Command generates Tailwind config fragment
- [ ] Command supports multiple themes and modes
- [ ] Command provides build progress and timing
- [ ] Command handles errors gracefully with helpful messages
- [ ] Command supports incremental builds for performance
- [ ] Command creates source maps for debugging
- [ ] Command supports custom naming conventions
- [ ] Unit tests with 90%+ coverage
- [ ] Integration tests verify token building

## Tasks

- [ ] Implement token build command
- [ ] Add file watching functionality
- [ ] Create schema validation
- [ ] Add multiple output format support
- [ ] Implement token reference resolution
- [ ] Add CSS custom property generation
- [ ] Create Tailwind config generation
- [ ] Add theme and mode support
- [ ] Implement incremental builds
- [ ] Add source map generation
- [ ] Create custom naming support
- [ ] Add progress tracking and timing
- [ ] Implement error handling
- [ ] Write comprehensive unit tests
- [ ] Add integration tests
- [ ] Create documentation and examples

## Technical Requirements

- **Token Resolution**: Handle nested references and inheritance
- **Schema Validation**: Validate against JSON schema
- **File Watching**: Efficient file system monitoring
- **Multiple Formats**: Support CSS, SCSS, Tailwind output
- **Performance**: Optimize for large token files
- **Testing**: Unit and integration test coverage

## Output Formats

- **CSS**: Standard CSS custom properties
- **SCSS**: SCSS variables and mixins
- **Tailwind**: Tailwind config fragment
- **JSON**: Structured token data
- **TypeScript**: Type definitions

## Build Options

- **--watch**: Watch for file changes
- **--output**: Custom output directory
- **--format**: Output format (css, scss, tailwind)
- **--minify**: Minify output
- **--sourcemap**: Generate source maps
- **--verbose**: Detailed logging

## Token Features

- **References**: Support for `{token.path}` syntax
- **Themes**: Multiple theme support
- **Modes**: Light/dark mode support
- **Responsive**: Responsive token values
- **Custom**: Custom token types

## Notes

- Must handle large token files efficiently
- Support for different token naming conventions
- Consider caching for performance
- Provide clear error messages for invalid tokens
- Support for custom token transformations
