---
id: CLI-INIT
track: cli
depends_on: ["CLI-CORE", "TOKENS-BUILD", "THEME-RUNTIME"]
size: M
labels: [feat]
---

## Summary

init command for Next/Vite

## Acceptance Criteria

- [ ] `refraction init` command detects project framework automatically
- [ ] `refraction init --framework next` explicitly sets Next.js framework
- [ ] `refraction init --framework vite` explicitly sets Vite framework
- [ ] Command creates `.refractionrc` configuration file
- [ ] Command patches `tailwind.config.js` with Refraction tokens
- [ ] Command adds `tokens.css` file to project styles
- [ ] Command adds `ThemeProvider` to app root component
- [ ] Command installs required dependencies (if not present)
- [ ] Command supports `--dry-run` flag for preview mode
- [ ] Command supports `--force` flag to overwrite existing files
- [ ] Command provides clear success/error messages
- [ ] Command validates project structure before proceeding
- [ ] Command creates sample token files if none exist
- [ ] Command updates package.json scripts for token building
- [ ] Command supports TypeScript and JavaScript projects
- [ ] Command handles different project structures (src/, app/, etc.)
- [ ] Integration tests verify setup works in real projects
- [ ] Unit tests with 90%+ coverage

## Tasks

- [ ] Implement framework detection logic
- [ ] Create configuration file generator
- [ ] Implement Tailwind config patching
- [ ] Add CSS file generation
- [ ] Implement ThemeProvider integration
- [ ] Add dependency installation logic
- [ ] Create sample token files
- [ ] Add package.json script updates
- [ ] Implement validation and error handling
- [ ] Add dry-run and force flag support
- [ ] Write comprehensive unit tests
- [ ] Add integration tests with real projects
- [ ] Create documentation and examples

## Technical Requirements

- **Framework Detection**: Analyze package.json and project structure
- **File Patching**: Safely modify existing configuration files
- **Dependency Management**: Install required packages
- **Error Handling**: Graceful failure with helpful messages
- **Validation**: Verify project structure and requirements
- **Testing**: Unit and integration test coverage

## Supported Frameworks

- **Next.js**: App Router and Pages Router
- **Vite**: React, Vue, Svelte templates
- **Create React App**: Standard CRA projects
- **Custom**: Manual configuration mode

## Generated Files

- `.refractionrc`: Project configuration
- `tokens.css`: Generated CSS custom properties
- `tailwind.config.js`: Patched with Refraction tokens
- `src/providers/ThemeProvider.tsx`: Theme provider component
- `tokens/`: Sample token files

## Notes

- Must work with existing projects without breaking them
- Support for both TypeScript and JavaScript
- Consider different project structures and conventions
- Provide clear documentation for manual setup
- Support for custom configurations and overrides
