# Governance

## Decision making
- Day to day: maintainers decide via PR review.
- Significant changes: open an RFC (issue labeled RFC). Result becomes an ADR.
- At least 2 maintainer approvals needed for RFC acceptance.

## Roles
- **Maintainer**: merge rights, triage issues, publish releases.
- **Contributor**: anyone sending PRs or issues.
- **User**: consumes the library.

## RFC flow
1. Open an RFC issue with problem, rationale, alternatives.
2. Draft ADR in `docs/adrs/` (copy template 0000).
3. Community discussion stays open ≥ 5 days unless urgent.
4. Maintainers accept or reject. Accepted RFC gets an ADR number and status Updated to “Accepted”.

## Issue triage
- Labels: bug, feature, docs, good first issue, help wanted, breaking, a11y, tokens, cli, mcp.
- First response SLA: 72 hours.
- Security or a11y critical issues get priority.

## Release process
- Each PR that changes packages must include a Changeset.
- Weekly or on-demand release. Changelogs generated automatically.
- Patch releases can go out anytime for urgent fixes.

## Code ownership
- Optional OWNERS files per package. Otherwise any maintainer can review.
- Disagreements escalated to project lead; final decision documented in ADR.

## Conduct
- Follows `CODE_OF_CONDUCT.md`. Maintainers enforce. Violations can lead to warnings, temporary bans, or permanent removal.

## Transparency
- Roadmap and backlog are public.
- Meeting notes or decisions affecting users are logged as ADRs or issues.

## Sunset policy
- Deprecated packages/components get “deprecated” label and notice in docs.
- After one major release cycle, they may be removed.

