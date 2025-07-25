---
id: CI-SETUP
track: ci
depends_on: ['DOCS-FREEZE']
size: S
labels: [chore]
---

## Summary
Add GitHub Actions workflows for CI

## Acceptance Criteria
- CI runs lint, typecheck, tests, build, storybook tests, size check on PR
- Required checks marked in GitHub branch protection

## Tasks
- Commit workflow files
- Add size script
- Configure branch protection

## Notes

