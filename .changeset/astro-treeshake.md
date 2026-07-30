---
"@refraction-ui/astro": patch
"@refraction-ui/react": patch
---

fix(astro): consumer builds no longer fail on optional analytics vendor SDKs

Measuring the Astro meta's tree-shaking (mirroring yesterday's React meta
probe) showed the output-side story was already healthy — a scratch Astro site
importing a single component ships only that component plus its headless core
in the server bundle, with zero code from the other 251 embedded packages —
but the build itself was broken for real consumers: the embedded analytics
sinks dynamically imported `posthog-js` and `@microsoft/applicationinsights-web`
via statically-analyzable string literals. Those are optional peers of the
private sink packages, so consumers don't have them installed, and vite/rollup
fails the whole `astro build` at module-graph resolution time — long before
tree-shaking can drop the unused modules. The repo never noticed because
`auto-install-peers` makes the peers resolvable inside the workspace.

The sink sources now route those specifiers through module-level consts
(`posthogJsSpecifier`, `appInsightsWebSpecifier`), keeping the imports
runtime-only — the same idiom `logger`'s faro engine already uses. A
`/* @vite-ignore */` annotation (previously present on the App Insights
import) does not help: vite still resolves literal dynamic-import specifiers
in SSR builds.

React ripple: the React meta previously *vendored* both vendor SDKs into its
published chunks (resolvable at build time via workspace auto-installed
peers). Its dist now also keeps them as runtime imports, matching the
documented "fully optional peer" contract — consumers who opt into
`client-sdk` mode or session replay install the SDK themselves; everyone else
never resolves it.

Adds `packages/astro-meta/__tests__/treeshake.test.ts` guardrails: the shipped
entry must stay a pure re-export module, no shipped module may reference a
bare specifier besides the `astro` peer, and a real `astro build` of a
one-component consumer site (without the optional peers) must succeed and
bundle only that component.
