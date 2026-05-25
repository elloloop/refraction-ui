# Handoff — Flutter: finish Wave 2/3 (publish milestone DONE)

Scope of this doc: **Flutter only.** The web side
(`@refraction-ui/react@0.9.3`, `astro@0.8.1`, `tailwind-config`; `shared`
private; Angular removed) is shipped and done — not your concern here. Repo
law is in `CLAUDE.md`; full context in project memory. This file is the plan
to finish the remaining Flutter waves.

## Status: `refraction_ui@0.2.0` is LIVE on pub.dev ✅

The "ready for Flutter apps" milestone (old ONBOARDING steps 1–2) is
**complete** — executed by a prior session/agent, verified 2026-05-18:

- pub.dev **`refraction_ui@0.2.0`** published 2026-05-17 22:03 UTC. The
  published archive was verified to contain `lib/src/telemetry` +
  `lib/src/analytics` (incl. `analytics/mobile`) — the real telemetry/
  analytics package, not the old 0.1.0 UI-only lib.
- The pre-existing repo-wide **`dart format` drift blocker was cleared**
  (#292) — `make check` / `flutter-publish` CI no longer red on it.
- pubspec bumped **0.1.0 → 0.2.0** (#297); **pub.dev OIDC trusted
  publishing configured** (#298). Flutter publishes via the tag-driven
  `flutter-publish` workflow — SEPARATE from npm (no changeset, no Version
  PR, no metas).
- Shipped & closed: telemetry **core #226 ✅ / mobile #227 ✅**; analytics
  **core #231 ✅ / mobile #232 ✅**. `packages/flutter` =
  ONE Dart package `refraction_ui` (web/android/ios/desktop = one uniform
  surface via internal conditional imports; NO per-platform packages).

## What's LEFT (ordered)

1. **Finish the remaining waves** (background Opus agents in isolated
   worktrees; each `flutter test` + `make ci` verified by LOG CONTENT; land
   via explicit `git` pathspec + `gh pr … --squash --admin`):
   - **#228** — Flutter logger Wave 2: Desktop (macOS/Windows/Linux) —
     lifecycle, persistence, window-close flush.
   - **#233** — Flutter analytics Wave 2: Desktop — GA4 Measurement Protocol
     + Azure App Insights sinks.
   - **#229** — Flutter logger Wave 3: dogfood widgets + telemetry docs.
   - **#234** — Flutter analytics Wave 3: dogfood widgets + analytics docs.
2. **Re-release to pub.dev** after the waves: keep `dart format` clean (the
   old blocker — re-verify), bump `packages/flutter/pubspec.yaml`
   (`0.2.0 → 0.3.0`), update `packages/flutter/CHANGELOG.md`, verify
   `flutter pub get/analyze/test` green by LOG CONTENT, land, then trigger
   the tag-driven `flutter-publish` workflow per
   `packages/flutter/RELEASING.md`. Verify on pub.dev the new archive
   contains the desktop layers.
3. **Optional — Flutter component parity** (epic **#259**): start **#260**
   (parity matrix / gap analysis) → batches **#261** forms/inputs, **#262**
   nav/layout, **#263** overlays/data/feedback, **#264** AI/media/voice.
   ~48 components missing vs web. Large, independent effort.

## Flutter issue IDs

- Epic **#225** (Flutter telemetry): #226 ✅, #227 ✅ · **#228 open**,
  **#229 open** (epic stays open until both close).
- Epic **#230** (Flutter analytics): #231 ✅, #232 ✅ · **#233 open**,
  **#234 open** (epic stays open until both close).
- Epic **#259** (Flutter component parity): **#260, #261, #262, #263, #264
  open**.
- Ignore legacy `[Flutter] AI Elements` #172/#179 (unrelated pre-existing).

## Non-negotiable process rules

- **Flutter contracts are reused VERBATIM** from the web cores (Segment
  envelope, OTLP wire, Sink SPI, session/identity/consent). Only Dart
  engine/lifecycle adapters are added. **Uniform structure across
  web/android/ios/desktop** via internal conditional imports — NO
  per-platform packages, NO contract redefinition.
- **Verify by LOG CONTENT, never by wrapper exit code or sub-agent report.**
  `flutter test` → `All tests passed!` / `+N`; `make ci` → `Tasks: N
  successful, N total`, 0 FAIL. Never merge past red.
- Flutter is its OWN release path (pub.dev, tag-driven, OIDC). Do NOT add a
  changeset, do NOT touch npm metas for Flutter work. Keep `dart format`
  clean before every release (it was the original publish blocker).
- git/dev workflow via `stax`; landing uses the standing exception (explicit
  `git add <pathspec>` + `gh --squash --admin`) because `stax` whole-tree
  diffs can't scope around the many locked `.claude/worktrees/agent-*`.
- Background agents: Opus, isolated worktree, must STOP-and-report rather
  than ship broken; recover their worktree faithfully and re-verify yourself.
- Store compliance (`packages/flutter/store_compliance/`) is acceptance
  criteria for the desktop/dogfood waves — keep it accurate.

---
_This is a local handoff doc (not a git-tracked repo file). Share it to the
next session via the onboarding-guide share link if needed._
