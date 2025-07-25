---
id: CLI-UPGRADE
track: cli
depends_on: ["CLI-ADD"]
size: M
labels: [feat]
---

## Summary

upgrade command using version headers

## Acceptance Criteria

- [ ] `refraction upgrade` upgrades all components to latest version
- [ ] `refraction upgrade button` upgrades specific component
- [ ] `refraction upgrade --check` shows available upgrades without applying
- [ ] `refraction upgrade --dry-run` previews changes without applying
- [ ] `refraction upgrade --diff` shows detailed differences
- [ ] Command reads version headers from component files
- [ ] Command performs three-way diff (base, current, new)
- [ ] Command applies patches safely with conflict resolution
- [ ] Command creates backup of modified files
- [ ] Command supports rollback to previous version
- [ ] Command validates component compatibility
- [ ] Command updates dependencies if needed
- [ ] Command shows progress and success messages
- [ ] Command handles merge conflicts gracefully
- [ ] Command supports batch upgrades for multiple components
- [ ] Command respects project-specific customizations
- [ ] Command updates documentation and examples
- [ ] Command validates upgrade success
- [ ] Unit tests with 90%+ coverage
- [ ] Integration tests verify upgrade process

## Tasks

- [ ] Implement version header parsing
- [ ] Create three-way diff algorithm
- [ ] Add patch application logic
- [ ] Implement conflict resolution
- [ ] Add backup and rollback functionality
- [ ] Create compatibility validation
- [ ] Add dependency update logic
- [ ] Implement progress tracking
- [ ] Add merge conflict handling
- [ ] Create batch upgrade support
- [ ] Add customization preservation
- [ ] Implement upgrade validation
- [ ] Write comprehensive unit tests
- [ ] Add integration tests
- [ ] Create documentation and examples

## Technical Requirements

- **Version Parsing**: Extract version information from file headers
- **Three-Way Diff**: Compare base, current, and new versions
- **Patch Application**: Safely apply changes with conflict resolution
- **Backup System**: Create and manage file backups
- **Conflict Resolution**: Handle merge conflicts gracefully
- **Testing**: Unit and integration test coverage

## Version Header Format

```typescript
/**
 * @refraction-version 1.2.3
 * @refraction-component button
 * @refraction-updated 2024-01-15
 */
```

## Upgrade Process

1. **Check**: Verify current version and available upgrades
2. **Backup**: Create backup of current files
3. **Download**: Fetch new component versions
4. **Diff**: Perform three-way comparison
5. **Apply**: Apply changes with conflict resolution
6. **Validate**: Verify upgrade success
7. **Cleanup**: Remove temporary files

## Conflict Resolution

- **Auto-resolve**: Apply changes automatically when safe
- **Manual**: Prompt user for conflict resolution
- **Skip**: Skip conflicting files with warning
- **Abort**: Rollback all changes on critical conflicts

## Notes

- Must preserve user customizations
- Support for partial upgrades
- Consider breaking changes and migrations
- Provide clear documentation for manual upgrades
- Support for custom upgrade strategies
