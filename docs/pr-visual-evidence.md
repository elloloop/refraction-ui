# Before-and-after evidence for UI pull requests

Founder requirement, 2026-10-01: visible changes need a comparison before approval.
The check rejects incomplete evidence. A human confirms that images are real,
render in the PR, cover the changed paths, and show comparable data, state,
viewport, locale and theme. Green checks alone cannot establish visual quality.

## Scope and author flow

`scripts/visual_evidence.py` classifies source and assets under packages, docs-site and Storybook, including
headless variants, framework adapters, Flutter and design tokens. Test-only, backend, prose,
lockfile and dependency-manifest changes need no screenshots. Manifest upgrades
that do alter the visible product must still include evidence voluntarily: path
classification cannot infer the behavior of a dependency release. Deleted and
renamed UI paths count too. New UI roots must extend the policy and its tests.

Fill `## Visual evidence` in the PR template. Supply full merge-base and PR head
SHAs; `git merge-base origin/main HEAD` and `git rev-parse HEAD` print them. List
**every candidate path**, once, with a specific coverage reason of at least 40
characters. The check prints the expected paths and references on refusal.
Capture before and after with matching content and viewports. Include affected
mobile/tablet/desktop sizes and relevant empty, populated, error and focused
states. Multiple images can appear under each side, with descriptive alt text.

Only HTTPS forge attachments, legacy GitHub image uploads, and immutable raw
GitHub image links are accepted. User-supplied URLs are never fetched, and no
credential is given to a media host. Distinct links are required; links alone
cannot prove the pixels differ or that the files exist. Reviewers must open the
PR and verify that they render. Markdown HTML, reference images, comments and
fenced examples do not satisfy the schema; use the literal Markdown structure.

## Genuine exceptions require an independent review

A private rename/refactor in a UI source file can use `Evidence-type: nonvisual`.
Keep Context and both refs; replace comparison subsections with a `Verification:`
line (60+ characters describing the actual command, result and inspection).
Every candidate path still needs a concrete exclusion reason (40+ characters).
There is no blanket exemption label, author checkbox or `N/A` bypass.

For keyboard, announcements or interaction changes that a still image cannot
prove, use `Evidence-type: behavior`. Keep Before/After `Caption:` lines and
add an `Observation:` line to each (60+ characters describing actual behavior).
Include `Why-no-screenshots:` and `Verification:` lines (60+ characters each).
Link a recording or transcript alongside the observations when appropriate.
If pixels/layout also change, use screenshots and supplement them with behavior
observations or recordings rather than asking for this exception.

Both exception modes fail until a non-author maintainer approves the current
head, with the following exact line in the approval review body:

```text
Visual-evidence-exemption: <SHA-256 printed by the check>
```

The digest covers the cleaned evidence section. Editing its content or pushing
another commit invalidates that approval. Dismissed/stale/rejected reviews and
read-only reviewers cannot authorize an exemption. Gitea uses the review's
`official` flag; GitHub checks repository write/maintain/admin permission. This
review is narrowly about evidence applicability; the optional five-seat code
review panel remains optional.

## Commands and activation

```sh
python3 scripts/visual-evidence-check.py --policy refraction --base origin/main --body /tmp/pr.md
python3 scripts/visual-evidence.test.py
make ci
python3 scripts/visual-evidence-check.py --policy refraction --base origin/main --body /tmp/pr.md
```

Local exceptions deliberately fail without forge verification. The `--structure-only` option validates the schema before a PR exists and prints approval as PENDING; it cannot be combined with `--pr`. To verify an
approved exception, run the same command CI runs with `--pr <number>` and a
read-only `EVIDENCE_TOKEN` injected in the environment. Never save a token in a
body file. The check reads current PR metadata twice and refuses changes while
it runs; it never executes PR body text. API failures fail closed.

The separate `visual-evidence` check must be
**added** to `main`'s existing required statuses after this workflow lands.
Preserve all existing checks, approvals, push restrictions and bypass rules.
Confirm the exact emitted context in the PR's statuses before adding it. Old
branches must rebase so they report the new check. Stacked destination branches
need equivalent protection if they must also block merges.

Until that additive branch-protection change is made and read back from the
forge, this is a failing CI check, **not an activated mandatory merge gate**.
Test activation with a UI PR missing one side (merge blocked), then complete its
comparison (check passes); confirm a backend-only PR passes without images.

Opened, synchronized, reopened and edited PRs rerun the check, as do submitted,
edited and dismissed reviews. Forge statuses attach to commits rather than
transactionally to PR body revisions: wait for the latest metadata-triggered
run before merging. Normal PR workflows are judged from the PR's own code;
this gate shares that trust boundary. It is not an adversarial guarantee
against a contributor changing the gate itself. Review CI-policy changes
independently. The workflow follows the existing PR Validation runner model;
no release, deployment or package publishing is part of this change.
