# AI Agent Instructions

## Mandatory Pre-Push Workflow
Before pushing any commits to the remote repository, you **MUST** run the local CI pipeline to verify that everything works:

1. Run `make ci` in the root directory.
2. If `make ci` fails, you must fix the errors, commit the fixes, and run `make ci` again until it passes.
3. **NEVER** push failing code to the remote repository.

## Mandatory NPM Publish After Every Change

Every code change pushed to `main` **MUST** result in a published version on npmjs under the `latest` dist-tag. The only exception is if the user explicitly says "only canary."

### How publishing works
- The CI pipeline on `main` runs `scripts/publish-oidc.mjs` via GitHub Actions OIDC. It automatically publishes any package whose `package.json` version does not yet exist on npm.
- **There are no changesets or automated version bumps.** You must manually bump the version yourself.

### Steps to follow after every code change
1. Identify which packages were modified (check `packages/` directories that were touched).
2. For each modified package, run `npm version patch --no-git-tag-version --prefix packages/<name>` to bump its version.
3. Also bump the **meta-packages** that re-export the modified packages:
   - `packages/react-meta` → publishes as `@refraction-ui/react`
   - `packages/angular-meta` → publishes as `@refraction-ui/angular`
   - `packages/astro-meta` → publishes as `@refraction-ui/astro`
4. Include the version bumps in the same commit or a follow-up commit.
5. Push directly to `main`. The CI will build, test, and then the Release workflow will publish all new versions to npm with the `latest` tag.
6. After pushing, confirm publication by running: `npm view @refraction-ui/react dist-tags --json`

### Rules
- **Default is `latest` tag.** Always publish to the stable `latest` dist-tag unless the user explicitly requests "only canary."
- **Never skip the version bump.** If you forget to bump, the publish script will see the version already exists on npm and skip it — meaning your change will NOT be published.
- **Report the version numbers.** After pushing, tell the user the exact version numbers that will be published (e.g., `@refraction-ui/react@0.3.9`).
