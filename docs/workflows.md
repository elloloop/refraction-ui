# GitHub Workflows Documentation

This document describes all GitHub Actions workflows in the Refraction UI project.

## Overview

The project uses several automated workflows to ensure code quality, security, and efficient release management:

- **CI**: Comprehensive testing and quality checks
- **Release**: Automated package publishing with Changesets
- **PR Checks**: Pull request validation and template compliance
- **Auto Label**: Automatic labeling based on file changes
- **Test Matrix**: Multi-environment testing
- **Issue Management**: Automated issue triage and maintenance
- **Issue Sync**: Bidirectional sync between GitHub issues and markdown files
- **Dependabot**: Automated dependency updates

## Workflow Details

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Purpose**: Main continuous integration pipeline that runs on all PRs and pushes to main.

**Jobs**:

- **Security**: CodeQL analysis for security vulnerabilities
- **Dependencies**: Dependency audit and outdated package checks
- **Build & Test**: Lint, typecheck, unit tests, build, Storybook tests, bundle size check
- **Performance**: Bundle analysis and performance regression detection

**Triggers**:

- Pull request events (opened, synchronize, reopened)
- Push to main branch

**Key Features**:

- Uses pnpm with Node 18
- Turbo monorepo optimization
- CodeQL security scanning
- Dependency vulnerability checks
- Coverage reporting with Codecov
- Performance regression detection

### 2. Release Workflow (`.github/workflows/release.yml`)

**Purpose**: Automated package publishing using Changesets.

**Jobs**:

- **Release**: Creates release PRs and publishes packages

**Triggers**:

- Push to main branch

**Key Features**:

- Changesets integration for version management
- Automatic release PR creation
- Package publishing to npm
- Enhanced release notes generation
- Validation of changeset format

**Required Secrets**:

- `NPM_TOKEN`: NPM authentication token
- `GITHUB_TOKEN`: GitHub authentication (automatically provided)

### 3. PR Checks Workflow (`.github/workflows/pr-checks.yml`)

**Purpose**: Validates pull request quality and compliance.

**Jobs**:

- **Verify Template**: Ensures PR template is properly filled
- **Breaking Changes**: Validates breaking change documentation
- **Commit Messages**: Checks conventional commit format
- **Large Files**: Warns about potentially problematic large files

**Triggers**:

- Pull request events (opened, synchronize, reopened)

**Key Features**:

- Template validation
- Conventional commit checking
- Large file detection
- Breaking change validation

### 4. Auto Label Workflow (`.github/workflows/labeler.yml`)

**Purpose**: Automatically applies labels to PRs based on file changes.

**Configuration**: `.github/labeler.yml`

**Labels Applied**:

- **Track-based**: `track/ci`, `track/release`, `track/cli`, `track/components`, `track/tokens`, `track/mcp`, `track/docs`, `track/storybook`
- **Size-based**: `size/XS`, `size/S`, `size/M`, `size/L`, `size/XL`
- **Type-based**: `type/bug`, `type/feature`, `type/chore`, `type/docs`, `type/refactor`, `type/test`
- **Priority-based**: `priority/high`, `priority/medium`, `priority/low`
- **Special**: `breaking`, `a11y`, `performance`

**Triggers**:

- Pull request events (opened, synchronize)

### 5. Test Matrix Workflow (`.github/workflows/test-matrix.yml`)

**Purpose**: Ensures compatibility across different Node.js versions and environments.

**Jobs**:

- **Test Matrix**: Tests across Node 16, 18, and 20
- **Browser Tests**: Storybook and accessibility testing
- **Performance Regression**: Bundle analysis and performance checks

**Triggers**:

- Pull request events (opened, synchronize, reopened)
- Push to main branch

**Key Features**:

- Multi-Node.js version testing
- Browser compatibility testing
- Performance regression detection
- Accessibility testing

### 6. Issue Management Workflow (`.github/workflows/issue-management.yml`)

**Purpose**: Automated issue triage and maintenance.

**Jobs**:

- **Stale Issues**: Marks and closes stale issues/PRs
- **Issue Triage**: Automatically labels new issues
- **Dependency Alerts**: Creates issues for security vulnerabilities

**Triggers**:

- Weekly schedule (Mondays at 9 AM UTC)
- Manual dispatch

**Key Features**:

- Stale issue detection (30 days)
- Automatic issue labeling
- Security vulnerability reporting
- Issue triage automation

### 7. Issue Sync Workflow (`.github/workflows/issue-sync.yml`)

**Purpose**: Bidirectional synchronization between GitHub issues and markdown files.

**Jobs**:

- **GitHub to Markdown**: Creates/updates markdown files from GitHub issues
- **Markdown to GitHub**: Creates/updates GitHub issues from markdown files

**Triggers**:

- GitHub issue events (opened, edited, closed, reopened, labeled, unlabeled)
- Push events that modify files in `issues/issues/**/*.md`

**Key Features**:

- Anti-loop protection using special labels
- Automatic ID generation from issue titles
- Label mapping between GitHub and markdown formats
- Sync tracking with timestamps
- Structured markdown format with YAML frontmatter

**Anti-Loop Strategy**:

- Uses `synced-from-markdown` label to prevent infinite loops
- Conditional triggers based on file paths and labels
- Sync state tracking in frontmatter

### 8. Dependabot Configuration (`.github/dependabot.yml`)

**Purpose**: Automated dependency updates and security patches.

**Update Types**:

- **npm**: Weekly updates for all npm dependencies
- **GitHub Actions**: Weekly updates for workflow actions
- **Security**: Daily security vulnerability updates

**Key Features**:

- Automated PR creation
- Conventional commit messages
- Automatic labeling
- Selective updates (ignores major TypeScript updates)

## Required Secrets

The following secrets must be configured in the repository settings:

| Secret          | Purpose                | Required By                   |
| --------------- | ---------------------- | ----------------------------- |
| `NPM_TOKEN`     | NPM package publishing | Release workflow              |
| `GITHUB_TOKEN`  | GitHub API access      | All workflows (auto-provided) |
| `CODECOV_TOKEN` | Coverage reporting     | CI workflow (optional)        |

## Branch Protection

To ensure workflow effectiveness, configure branch protection rules for the `main` branch:

1. **Require status checks to pass before merging**:

   - `CI / security`
   - `CI / dependencies`
   - `CI / build-test`
   - `Test Matrix / test-matrix`
   - `Test Matrix / browser-tests`

2. **Require branches to be up to date before merging**

3. **Require pull request reviews before merging**

4. **Require conversation resolution before merging**

## Workflow Maintenance

### Adding New Workflows

1. Create the workflow file in `.github/workflows/`
2. Update this documentation
3. Test the workflow with a draft PR
4. Configure any required secrets

### Modifying Existing Workflows

1. Test changes in a feature branch
2. Update documentation
3. Consider backward compatibility
4. Monitor workflow performance

### Troubleshooting

Common issues and solutions:

**Workflow Fails on Dependency Installation**:

- Check pnpm version compatibility
- Verify lockfile integrity
- Clear GitHub Actions cache

**Security Scanning Issues**:

- Ensure CodeQL is enabled for the repository
- Check for sufficient permissions
- Verify language detection

**Release Workflow Issues**:

- Verify NPM_TOKEN is configured
- Check Changesets configuration
- Ensure proper version bumping

## Performance Considerations

- Workflows use caching to improve performance
- Parallel job execution where possible
- Selective workflow triggers to avoid unnecessary runs
- Resource optimization with appropriate runner types

## Security

- All workflows use minimal required permissions
- Secrets are properly scoped
- Security scanning is integrated into CI
- Dependency vulnerabilities are automatically detected

## Monitoring

Monitor workflow health through:

- GitHub Actions dashboard
- Workflow run logs
- Performance metrics
- Failure rate tracking

## Future Enhancements

Potential improvements:

- E2E testing integration
- Performance benchmarking
- Automated changelog generation
- Release notes automation
- Multi-platform testing
- Automated documentation updates
