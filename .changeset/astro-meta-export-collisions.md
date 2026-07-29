---
"@refraction-ui/astro": patch
---

Fix name collisions in the meta package's public entry.

`astro-logger` and `astro-analytics` both re-exported `createConsoleSink`,
`createMockSink` and the `ConsoleSinkOptions` type from their respective
headless cores. Under plain `export *` in the meta entry that is a TS2308
for consumers, and at runtime the ambiguous star exports were dropped from
the ESM namespace entirely — so none of the three names was actually
reachable from `@refraction-ui/astro`. Following the react-meta pattern,
the pre-existing logger names stay canonical and the analytics variants are
now surfaced under aliases: `createAnalyticsConsoleSink`,
`createAnalyticsMockSink` and `AnalyticsConsoleSinkOptions`.

The shipped `dist/index.ts` is now generated from the hand-maintained
`src/index.ts` (single source of truth — selective re-exports and their
why-comments can no longer drift between source and artifact), and the meta
entry is typechecked in CI via the new `tsconfig.json`.

Also fixes two adapter re-exports that were broken at source level
(`export *` pointing at a `.astro` file, which has no wildcard surface):
`@refraction-ui/astro-file-tree` now exports `FileTree` and
`@refraction-ui/astro-icon-system` exports `IconSystem` — the same named
exports the meta build previously synthesized for them.

Story fixtures for the Astro DataTable, DiffViewer, SlideViewer and
VersionSelector stories were corrected to match their headless core
contracts (`ColumnDef`, `DiffFile`, `SlideData`, `VersionOption`). Stories
are not part of the published artifact; the meta export fix is what ships.
