# CLI Spec

Binary: `refraction-ui`

## Commands

### init
Bootstrap project: Tailwind patch, tokens.css, provider, config.

### add <component...>
Copy templates into `components/ui`, update imports, run optional post hooks.

### remove <component>
Delete files and clean imports.

### upgrade <component|all>
Diff local copy with latest template version, show patch, apply if accepted.

### tokens import <file>
Convert external tokens (Style Dictionary, Figma Tokens) to refraction schema.

### tokens build
Emit CSS vars and Tailwind plugin fragments.

### a11y [pattern]
Accessibility test runner powered by **axe-core**. Patterns can be component
paths, Storybook story IDs or live URLs.

```
refraction-ui a11y button.tsx
refraction-ui a11y components/* --storybook
refraction-ui a11y https://example.com --url
```

Options:

- `--strict` - exit with non-zero code when violations are found.
- `--json [file]` - write results as JSON (default `a11y-report.json`).
- `--html [file]` - write an HTML report (default `a11y-report.html`).
- `--rules <file>` - load custom axe rules from a JS module.
- `--viewport <WxH>` - screen size for tests (e.g. `1280x800`).

The command prints a summary to the console. Reports include the failing
selector, rule ID, guidance links and a short fix suggestion for each node.
Designed for CI/CD pipelines where `--strict` makes the job fail on
violations.

### doctor
Check config, dependencies, folder layout.

## Flags
- `--dry`: do not write, only show actions.
- `--diff`: print unified diff.
- `--framework react|svelte|vue`
- `--engine internal|radix|headlessui`

## Config file
`.refractionrc.(json|ts)`

Fields: paths (componentsDir, stylesDir), defaultEngine, frameworks, tokensPath.
