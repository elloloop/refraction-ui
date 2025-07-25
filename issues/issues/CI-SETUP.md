---
id: CI-SETUP
track: ci
depends_on: ["DOCS-FREEZE"]
size: S
labels: [chore]
status: done
---

## Summary

Add GitHub Actions workflows for CI

## Acceptance Criteria

- ✅ CI runs lint, typecheck, tests, build, storybook tests, size check on PR
- ✅ Required checks marked in GitHub branch protection
- ✅ Multiple workflow files implemented: ci.yml, pr-checks.yml, test-matrix.yml, release.yml, issue-sync.yml, status-badges.yml, issue-management.yml, labeler.yml

## Tasks

- ✅ Commit workflow files
- ✅ Add size script
- ✅ Configure branch protection

## Notes

**COMPLETED** - All CI workflows are implemented and functional. The project has comprehensive CI/CD setup with:

- Automated testing and linting
- PR checks and branch protection
- Release automation
- Issue synchronization
- Status badges
- Label management
