---
"@refraction-ui/react": patch
---

RSC: every published `@refraction-ui/react` JS entry (`.`, `./theme`,
`./form`, ESM + CJS) now ships the `'use client'` directive as its module
prologue. Previously the package shipped the directive nowhere, so importing
it from a Next.js App Router **Server Component** — e.g. mounting
`<AnalyticsProvider>` / `<TelemetryProvider>` / `<ThemeProvider>` in
`app/layout.tsx` — broke `next build` with the "`createContext` only works
in a Client Component" error. The directive is restored deterministically
post-build (tsup's bundling + `treeshake` strip both a source directive and
an esbuild banner), and a regression test locks it in. Server-safe headless
factories also re-exported here (`createAnalytics`/`createTelemetry`/
`createAI`/`cn`/`cva`) are now part of this client module — instantiate them
inside the client/provider boundary.
