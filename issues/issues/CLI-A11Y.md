---
id: CLI-A11Y
track: cli
depends_on: ["STORYBOOK-SETUP"]
size: S
labels: [a11y, feat]
---

## Summary

a11y command using axe-core. Initial implementation provided in
`scripts/a11y-check.js` which supports component, Storybook and URL testing.

## Acceptance Criteria

- [ ] `refraction a11y` runs accessibility tests on all components
- [ ] `refraction a11y --strict` fails on any accessibility violations
- [ ] `refraction a11y --json` outputs results in JSON format
- [ ] `refraction a11y --html` generates HTML accessibility report
- [ ] `refraction a11y button` tests specific component
- [ ] `refraction a11y --url` tests live website URLs
- [ ] `refraction a11y --storybook` tests Storybook stories
- [ ] Command uses axe-core for accessibility testing
- [ ] Command supports WCAG 2.1 AA compliance checking
- [ ] Command provides detailed violation descriptions
- [ ] Command suggests fixes for accessibility issues
- [ ] Command supports custom accessibility rules
- [ ] Command integrates with CI/CD pipelines
- [ ] Command supports different output formats (console, JSON, HTML)
- [ ] Command provides accessibility score and metrics
- [ ] Command supports testing different viewport sizes
- [ ] Command handles dynamic content and SPAs
- [ ] Unit tests with 90%+ coverage
- [ ] Integration tests verify accessibility testing

## Tasks

- [x] Implement axe-core integration
- [x] Create accessibility test runner
- [x] Add multiple output format support
- [x] Implement strict mode functionality
- [x] Add Storybook integration
- [x] Create URL testing capability
- [x] Add custom rule support
- [x] Implement CI/CD integration
- [ ] Add accessibility scoring
- [x] Create detailed reporting
- [x] Add fix suggestions
- [ ] Implement viewport testing
- [ ] Add dynamic content handling
- [ ] Write comprehensive unit tests
- [ ] Add integration tests
- [x] Create documentation and examples

## Technical Requirements

- **axe-core**: Use latest version for accessibility testing
- **Multiple Formats**: Support console, JSON, HTML output
- **CI Integration**: Provide proper exit codes and reports
- **Custom Rules**: Allow project-specific accessibility rules
- **Performance**: Optimize for large component libraries
- **Testing**: Unit and integration test coverage

## Accessibility Standards

- **WCAG 2.1 AA**: Primary compliance standard
- **WCAG 2.1 AAA**: Strict compliance option
- **Section 508**: US government compliance
- **Custom**: Project-specific rules

## Output Formats

- **Console**: Human-readable terminal output
- **JSON**: Machine-readable structured data
- **HTML**: Detailed visual report with screenshots
- **JUnit**: CI/CD integration format
- **Markdown**: Documentation-friendly format

## Test Types

- **Component**: Test individual React components
- **Storybook**: Test Storybook stories
- **URL**: Test live website pages
- **Screenshot**: Visual accessibility testing
- **Keyboard**: Keyboard navigation testing

## Notes

- Must integrate with existing testing frameworks
- Support for different accessibility standards
- Consider performance implications of testing
- Provide actionable feedback for developers
- Support for automated accessibility monitoring
