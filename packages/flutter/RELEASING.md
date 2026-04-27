# Releasing `refraction_ui` to pub.dev

The Flutter package is published **separately** from the JS/npm packages. JS releases are managed by changesets and the Release workflow on `main`/`stable`. Flutter releases are tag-driven and run through `.github/workflows/flutter-publish.yml`.

## TL;DR

```sh
# 1. Bump the version in pubspec.yaml and write CHANGELOG.md notes for it
# 2. Commit, get the change merged to main
# 3. From an up-to-date main:
git tag refraction_ui-v0.1.1
git push origin refraction_ui-v0.1.1
# 4. Watch the workflow at:
#    https://github.com/elloloop/refraction-ui/actions/workflows/flutter-publish.yml
```

That's it. The workflow runs the analyzer + tests + dry-run before doing the actual publish, so a broken release fails fast.

## Prerequisites (one-time, already done)

These are configured and don't need to be redone for routine releases. Listed here so a future maintainer rebuilding the trust chain knows what's connected to what.

1. **pub.dev** — `pub.dev/packages/refraction_ui/admin` is configured for "Publishing from GitHub Actions":
   - Repository: `elloloop/refraction-ui`
   - Tag pattern: `refraction_ui-v{{version}}`
   - Environment: `pub.dev`
   - `push` and `workflow_dispatch` events both enabled.
2. **GitHub Environment** — the repo has an Environment named `pub.dev` with a deployment-tag rule restricting it to tags matching `refraction_ui-v*`. No required reviewers (single-maintainer flow).
3. **Workflow** — `.github/workflows/flutter-publish.yml` runs in the `pub.dev` environment with `permissions: id-token: write`, exchanging a short-lived OIDC token for a temporary pub.dev publish token. **No long-lived secrets are stored.**

## Release procedure

### 1. Decide the new version

Follow [semver](https://semver.org/):

- **Patch** (`0.1.0` -> `0.1.1`) — bug fixes, docs, internal refactors, no API changes.
- **Minor** (`0.1.0` -> `0.2.0`) — additive API changes (new widgets, new props on existing widgets, new theme tokens).
- **Major** (`0.x` -> `1.0`) — only after the API is stable enough to commit to it. While on `0.x`, use minor for breaking changes and call them out clearly in the changelog.

### 2. Bump `pubspec.yaml` and update `CHANGELOG.md`

```yaml
# packages/flutter/pubspec.yaml
name: refraction_ui
version: 0.1.1   # bumped
```

```markdown
# packages/flutter/CHANGELOG.md
## 0.1.1

* Fix tooltip positioning on RTL locales (#NNN)
* Add `RefractionDatePicker` widget (#NNN)

## 0.1.0
... (previous entries)
```

The workflow's first gate compares the version parsed from the tag with `pubspec.yaml`. If they don't match, it fails before any publish runs — so this step must happen before tagging.

### 3. Commit and merge to `main`

Open a PR (or for trivial fixes, push directly with admin override). Make sure the commit lands on `main` before tagging — the workflow checks out the tagged commit, so the tagged commit must include the version bump.

### 4. Tag and push

From an up-to-date local `main`:

```sh
git pull --ff-only origin main
git tag refraction_ui-v0.1.1
git push origin refraction_ui-v0.1.1
```

Tag format must be exactly `refraction_ui-v<version>` — the workflow trigger and the pub.dev trust both filter on this pattern.

### 5. Watch the workflow

Open https://github.com/elloloop/refraction-ui/actions/workflows/flutter-publish.yml and click into the new run. The pipeline:

1. **Verify tag matches pubspec version** — fails fast if you tagged `refraction_ui-v0.1.1` but `pubspec.yaml` still says `0.1.0`.
2. **`dart analyze lib`** — must report `No issues found!`.
3. **`flutter test`** — must pass.
4. **`dart pub publish --dry-run`** — must say `Package has 0 warnings.`
5. **`dart pub publish --force`** — actually uploads. This step is the only one that touches pub.dev's API.

If any of (1)-(4) fails, no publish happens and the tag still exists — you can fix forward and either retry the workflow run (uses the same tag) or push a different tag for the corrected version.

### 6. Verify on pub.dev

Within ~30 seconds of step (5) finishing, the new version appears at https://pub.dev/packages/refraction_ui. The package score takes a few hours to recompute.

## Manual / emergency release

You can also fire the workflow without a tag via the Actions UI ("Run workflow"). This skips the tag-vs-pubspec check (since there's no tag) but still runs analyzer + tests + dry-run + publish. Use this only for retries or recovery — for normal releases, prefer the tag flow so the git history captures what was published.

## Yanking a bad release

pub.dev doesn't allow deleting a published version (and we don't want it to — anyone who depends on it would break). If a release is broken:

1. Mark it as **retracted** at https://pub.dev/packages/refraction_ui/versions — this hides it from new dependency resolutions while leaving it available for existing consumers.
2. Publish a fix immediately under a new patch version.

## Troubleshooting

**"OIDC token request failed"** — usually means the GitHub Environment isn't named exactly `pub.dev`, or the deployment-tag rule on the environment doesn't include the tag you pushed. Check `https://github.com/elloloop/refraction-ui/settings/environments/pub.dev`.

**"No matching tag found"** — pub.dev's automated-publishing config didn't match your tag against the configured pattern. Verify the tag is exactly `refraction_ui-v<version>` (including the `v`) and that the version on pub.dev's admin page is `refraction_ui-v{{version}}`.

**"Version mismatch"** — the workflow's pre-flight check ran and the tag's version doesn't match `pubspec.yaml`. Fix `pubspec.yaml` (or retag) so they agree.

**Build/test failure on the runner but not locally** — usually a Flutter SDK version drift. The workflow uses `subosito/flutter-action@v2.16.0` with `channel: stable`. Run `flutter upgrade` locally to match, or pin a specific Flutter version in the workflow if the channel is too volatile.
