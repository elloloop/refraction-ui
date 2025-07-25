# Versioning and upgrade policy

## Packages

- Semantic Versioning (semver)
  - MAJOR: breaking public API change
  - MINOR: new features that are backward compatible
  - PATCH: bug or docs fix

## Templates

- Each template has a `meta.json` with a `version`
- Generated files include a header comment:
  `// refraction-ui: dialog v0.3.1`
- `refraction-ui upgrade <component>` compares local vs latest and shows a diff

### Upgrade flow

1. Read local version from file header
2. Load latest template
3. Do a three-way diff (local vs old vs new)
4. Show unified diff. Options: apply, skip, interactive merge
5. After apply, update the header version

## Deprecations

- Mark deprecated props or files in changelog and docs
- Provide codemods when possible
- Remove deprecated APIs only in the next MAJOR

## Token and theme schema changes

- Additive fields are MINOR
- Renames or removals are MAJOR and must ship with a migration script
- Changing theme or mode structure (eg removing dark) is MAJOR

## Engine adapters

- Contract tests guard compatibility
- Breaking adapter API bumps the adapter package MAJOR, core stays stable if possible

## Changelogs

- Managed by Changesets
- Each release groups changes by package
- Include migration notes for any breaking change

## Supported versions

- Latest MAJOR is actively maintained
- Previous MAJOR gets security fixes only, for 6 months after a new MAJOR
