# AI Agent Instructions

## Mandatory Pre-Push Workflow
Before pushing any commits to the remote repository, you **MUST** run the local CI pipeline to verify that everything works:

1. Run `make ci` in the root directory.
2. If `make ci` fails, you must fix the errors, commit the fixes, and run `make ci` again until it passes.
3. **NEVER** push failing code to the remote repository.
