---
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

Remove Angular support entirely and make `@refraction-ui/shared` private.

- Deleted all `packages/angular-*` packages, including the `@refraction-ui/angular` meta (`angular-meta`), `angular-logger`, and `angular-analytics`. `@refraction-ui/angular` is no longer published.
- Removed Angular wiring from `update-meta-packages.cjs`, the now-dead `update-angular-meta.cjs` script, the root `@angular/*` pnpm overrides, and the root `zone.js` devDependency/override.
- Removed all Angular pages, framework tabs, code samples, and references from the docs site, README, instrumentation policy, and the Flutter package README/comments.
- `@refraction-ui/shared` is now `private: true` (no `publishConfig`). It is embedded into the published `@refraction-ui/react` and `@refraction-ui/astro` metas and is never published standalone. Both metas remain fully self-contained — verified by the meta self-containment tests and a pack-test (0 `@refraction-ui/*` import/require/export references in the packed runtime/declaration/shipped-source output).

The published npm packages are now exactly: `@refraction-ui/react`, `@refraction-ui/astro`, and `@refraction-ui/tailwind-config`. The patch bump on the metas reflects the changed embedded `@refraction-ui/shared` source.
