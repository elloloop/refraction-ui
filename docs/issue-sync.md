# Issue Sync Workflow

This document explains the automated synchronization between GitHub issues and markdown files in the `issues/issues/` folder.

## Overview

The Issue Sync workflow automatically creates and updates markdown files in the `issues/issues/` folder when GitHub issues are created or modified, and vice versa. This enables:

- **Dual tracking**: Issues can be managed both in GitHub and as markdown files
- **Offline work**: Markdown files can be edited locally and synced back to GitHub
- **Version control**: Issue history is tracked in git alongside code changes
- **Structured format**: Consistent issue format with YAML frontmatter

## How It Works

### Anti-Loop Strategy

To prevent infinite loops between GitHub issues and markdown files, the workflow uses:

1. **Special labels**: Issues created from markdown get a `synced-from-markdown` label
2. **Conditional triggers**: GitHub-to-markdown sync only runs on issues without the special label
3. **Path-based triggers**: Markdown-to-GitHub sync only runs when files in `issues/issues/` are changed
4. **Sync tracking**: Each sync operation includes timestamps and issue numbers

### Workflow Jobs

#### 1. GitHub to Markdown (`github-to-markdown`)

**Triggers**: GitHub issue events (opened, edited, closed, reopened, labeled, unlabeled)

**Process**:

1. Checks if issue has `synced-from-markdown` label (skips if present)
2. Generates issue ID from title (e.g., "Add Button Component" → "ADD-BUTTON-COMPONENT")
3. Creates/updates markdown file in `issues/issues/{ID}.md`
4. Extracts labels and maps them to frontmatter fields:
   - `track/*` → `track` field
   - `size/*` → `size` field
   - `type/*` and other labels → `labels` array
5. Adds `synced-from-markdown` label to prevent loops
6. Includes GitHub issue metadata in the Notes section

#### 2. Markdown to GitHub (`markdown-to-github`)

**Triggers**: Push events that modify files in `issues/issues/**/*.md`

**Process**:

1. Identifies changed markdown files
2. Parses YAML frontmatter and markdown content
3. Extracts sections (Summary, Acceptance Criteria, Tasks, Notes)
4. Maps frontmatter fields to GitHub labels:
   - `track` → `track/{track}`
   - `size` → `size/{size}`
   - `labels` → individual labels
5. Creates new GitHub issue or updates existing one
6. Updates markdown file with GitHub issue number

## File Format

### Markdown Structure

```markdown
---
id: COMP-BUTTON
track: components
depends_on: ["COMP-API-CONTRACT", "THEME-RUNTIME"]
size: M
labels: [feat, a11y]
github_issue: 123
synced_at: 2024-01-15T10:30:00.000Z
---

## Summary

Build Button primitive and styled wrapper

## Acceptance Criteria

- Tests pass
- Storybook story
- Axe 0 violations
- Size within budget

## Tasks

- [ ] Primitive
- [ ] Styled layer
- [ ] Tests
- [ ] Story

## Notes

GitHub Issue: #123
Status: open
Created: 2024-01-15T10:30:00.000Z
Updated: 2024-01-15T10:30:00.000Z
```

### Frontmatter Fields

| Field          | Description                      | Example                     |
| -------------- | -------------------------------- | --------------------------- |
| `id`           | Unique issue identifier          | `COMP-BUTTON`               |
| `track`        | Issue category/track             | `components`, `cli`, `docs` |
| `depends_on`   | Array of dependent issue IDs     | `['COMP-API-CONTRACT']`     |
| `size`         | Estimated effort                 | `XS`, `S`, `M`, `L`, `XL`   |
| `labels`       | Array of GitHub labels           | `[feat, a11y, bug]`         |
| `github_issue` | GitHub issue number (auto-added) | `123`                       |
| `synced_at`    | Last sync timestamp (auto-added) | `2024-01-15T10:30:00.000Z`  |

## Usage Guidelines

### Creating Issues

#### Via GitHub

1. Create a new GitHub issue
2. Add appropriate labels (`track/*`, `size/*`, `type/*`)
3. The workflow will automatically create a markdown file
4. Edit the markdown file locally if needed

#### Via Markdown

1. Create a new `.md` file in `issues/issues/`
2. Use the standard format with YAML frontmatter
3. Commit and push the file
4. The workflow will create a corresponding GitHub issue

### Updating Issues

#### Via GitHub

- Edit the GitHub issue (title, body, labels)
- Changes will be reflected in the markdown file
- The `synced_at` timestamp will be updated

#### Via Markdown

- Edit the markdown file locally
- Commit and push changes
- The GitHub issue will be updated automatically
- The `synced_at` timestamp will be updated

### Closing Issues

#### Via GitHub

- Close the GitHub issue
- The markdown file will be updated with the new status

#### Via Markdown

- Add `status: closed` to the frontmatter
- Commit and push
- The GitHub issue will be closed

## Label Mapping

### Track Labels

- `track/components` → `track: components`
- `track/cli` → `track: cli`
- `track/docs` → `track: docs`
- `track/ci` → `track: ci`
- `track/release` → `track: release`
- `track/tokens` → `track: tokens`
- `track/mcp` → `track: mcp`

### Size Labels

- `size/XS` → `size: XS`
- `size/S` → `size: S`
- `size/M` → `size: M`
- `size/L` → `size: L`
- `size/XL` → `size: XL`

### Type Labels

- `type/feat` → `labels: [feat]`
- `type/bug` → `labels: [bug]`
- `type/docs` → `labels: [docs]`
- `type/chore` → `labels: [chore]`

## Troubleshooting

### Common Issues

#### Sync Loop Detection

**Problem**: Workflow keeps running in circles
**Solution**: Check for `synced-from-markdown` label on GitHub issues

#### Missing Dependencies

**Problem**: `npm install yaml js-yaml` fails
**Solution**: The workflow includes the install step automatically

#### Invalid YAML

**Problem**: Frontmatter parsing errors
**Solution**: Ensure proper YAML syntax in markdown files

#### Permission Errors

**Problem**: Workflow can't write to repository
**Solution**: Check workflow permissions in repository settings

### Debugging

1. **Check workflow logs**: Look for error messages in GitHub Actions
2. **Verify file format**: Ensure markdown files follow the expected structure
3. **Check labels**: Verify GitHub issues have the correct labels
4. **Review sync timestamps**: Check `synced_at` field for recent activity

## Best Practices

### For GitHub Issues

- Use descriptive titles that generate good IDs
- Add appropriate track and size labels
- Include detailed acceptance criteria
- Use checkboxes for tasks

### For Markdown Files

- Follow the standard format consistently
- Use meaningful IDs (e.g., `COMP-BUTTON` not `ISSUE-1`)
- Keep dependencies up to date
- Include all required sections

### For Workflow Maintenance

- Monitor sync performance
- Review failed syncs regularly
- Update label mappings as needed
- Test changes in a branch first

## Configuration

### Workflow Settings

The workflow can be customized by modifying:

- **Trigger paths**: Change which files trigger markdown-to-GitHub sync
- **Label mappings**: Adjust how labels are converted between formats
- **File naming**: Modify the ID generation algorithm
- **Sync frequency**: Adjust when syncs occur

### Repository Settings

Required permissions:

- `contents: write` - For creating/updating markdown files
- `issues: write` - For creating/updating GitHub issues

## Future Enhancements

Potential improvements:

- **Conflict resolution**: Handle simultaneous edits
- **Bulk operations**: Sync multiple issues at once
- **Template customization**: Allow different markdown templates
- **Validation**: Add schema validation for frontmatter
- **Notifications**: Alert on sync failures
- **History tracking**: Maintain sync history
