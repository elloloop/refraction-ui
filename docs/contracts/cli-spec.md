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
Run axe-core checks on stories or a preview build. Fail on violations in strict mode.

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
