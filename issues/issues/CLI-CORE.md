---
id: CLI-CORE
track: cli
depends_on: ["DOCS-FREEZE", "TOKENS-SCHEMA"]
size: M
labels: [feat]
---

## Summary

CLI shell, config loader, fs utils

## Acceptance Criteria

- [ ] `refraction` command runs and displays help with available subcommands
- [ ] `refraction --version` displays current version
- [ ] `refraction --help` shows detailed help for each subcommand
- [ ] Configuration loader reads `.refractionrc` files (JSON/YAML/JS)
- [ ] Configuration supports project-level and global settings
- [ ] `fs.safeWrite` utility prevents overwriting files without explicit flag
- [ ] `fs.safeRead` utility with proper error handling
- [ ] `fs.findConfig` utility locates nearest config file
- [ ] CLI supports `--dry-run` flag for preview mode
- [ ] CLI supports `--verbose` flag for detailed logging
- [ ] Error handling with clear, actionable error messages
- [ ] Progress indicators for long-running operations
- [ ] Unit tests with 90%+ coverage
- [ ] Integration tests for config loading and file operations

## Tasks

- [ ] Set up CLI framework (commander.js or similar)
- [ ] Implement configuration loader with multiple format support
- [ ] Create file system utilities with safety checks
- [ ] Add command structure and help system
- [ ] Implement error handling and logging
- [ ] Add progress indicators and user feedback
- [ ] Write comprehensive unit tests
- [ ] Add integration tests
- [ ] Create documentation for CLI usage

## Technical Requirements

- **Framework**: Node.js with TypeScript
- **CLI Library**: Commander.js or similar
- **Config Formats**: JSON, YAML, JavaScript
- **File Safety**: Prevent accidental overwrites
- **Error Handling**: Graceful degradation with helpful messages
- **Testing**: Unit and integration test coverage
- **Documentation**: Inline help and external docs

## Configuration Schema

```json
{
  "tokens": {
    "input": "./tokens",
    "output": "./styles",
    "format": "css"
  },
  "components": {
    "output": "./components",
    "engine": "radix"
  },
  "cli": {
    "verbose": false,
    "dryRun": false
  }
}
```

## Notes

- Must be extensible for future subcommands
- Consider using a modern CLI framework for better UX
- Support for both global and project-specific configuration
- Implement proper exit codes for CI/CD integration
