---
id: CLI-ADD
track: cli
depends_on: ["CLI-CORE", "COMP-BUTTON"]
size: M
labels: [feat]
---

## Summary

add command to copy component templates

## Acceptance Criteria

- [ ] `refraction add button` adds Button component to project
- [ ] `refraction add --list` shows all available components
- [ ] `refraction add --dry-run` previews files without writing
- [ ] `refraction add --diff` shows differences with existing files
- [ ] `refraction add --force` overwrites existing files
- [ ] Command supports multiple components: `refraction add button input dialog`
- [ ] Command respects project structure (src/, components/, etc.)
- [ ] Command generates TypeScript and JavaScript versions
- [ ] Command includes proper imports and dependencies
- [ ] Command creates component files with proper naming
- [ ] Command adds component to index files for easy importing
- [ ] Command supports custom output directory
- [ ] Command validates component names and provides suggestions
- [ ] Command shows progress and success messages
- [ ] Command handles errors gracefully with helpful messages
- [ ] Command supports component variants and options
- [ ] Command creates Storybook stories for added components
- [ ] Command updates package.json if needed
- [ ] Unit tests with 90%+ coverage
- [ ] Integration tests verify component generation

## Tasks

- [ ] Implement component template system
- [ ] Create template loader and renderer
- [ ] Add component discovery and listing
- [ ] Implement file writing with safety checks
- [ ] Add diff generation logic
- [ ] Create dry-run functionality
- [ ] Add project structure detection
- [ ] Implement TypeScript/JavaScript generation
- [ ] Add import and dependency management
- [ ] Create index file updates
- [ ] Add component validation and suggestions
- [ ] Implement Storybook story generation
- [ ] Add progress indicators and messaging
- [ ] Write comprehensive unit tests
- [ ] Add integration tests
- [ ] Create documentation and examples

## Technical Requirements

- **Template System**: Flexible template rendering with variables
- **File Safety**: Prevent accidental overwrites
- **Project Detection**: Analyze project structure and conventions
- **Dependency Management**: Handle imports and package updates
- **Error Handling**: Graceful failure with helpful messages
- **Testing**: Unit and integration test coverage

## Available Components

- **button**: Button component with variants
- **input**: Input component with types
- **dialog**: Dialog/modal component
- **dropdown**: Dropdown menu component
- **tabs**: Tab navigation component
- **toast**: Toast notification component
- **tooltip**: Tooltip component
- **popover**: Popover component

## Component Options

- **--variant**: Component variant (primary, secondary, etc.)
- **--size**: Component size (sm, md, lg)
- **--type**: Component type (default, outlined, etc.)
- **--output**: Custom output directory
- **--no-stories**: Skip Storybook story generation

## Notes

- Must respect existing project conventions
- Support for different component libraries and patterns
- Consider TypeScript vs JavaScript project differences
- Provide clear documentation for manual component creation
- Support for custom component templates
