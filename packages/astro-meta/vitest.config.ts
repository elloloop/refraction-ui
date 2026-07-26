import { getViteConfig } from 'astro/config'

// `getViteConfig` wires the Astro vite plugin into Vitest so that `.astro`
// single-file components (the meta's copied dist sources) compile on import.
// The suite runs in node and renders via the Container API (`astro/container`).
//
// The esnext overrides mirror `.storybook-astro/main.ts`: the repo's pinned
// esbuild can't lower the modern syntax in Astro's own runtime to Vite's
// default legacy browser targets.

type ViteUserConfig = Parameters<typeof getViteConfig>[0]
type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
type ViteUserConfigFn = ReturnType<typeof getViteConfig>

// Astro's `astro:vite-plugin-environment` unconditionally assigns
// `optimizeDeps.include = ['astro/runtime/client/dev-toolbar/entrypoint.js',
// 'astro > html-escaper']` for the CLIENT environment. That entrypoint (and
// the toolbar apps it pulls in) uses modern syntax the repo's pinned esbuild
// cannot lower to Vite's default legacy browser targets, so the client
// dep-optimizer crashes Vitest at startup — and the plugin's wholesale
// assignment means neither top-level `exclude` nor `esbuildOptions.target`
// reach it. User plugins run after Astro's, so this `configEnvironment` hook
// wins. The tests are SSR-only (node environment); the client optimizer has
// nothing to do.
const disableClientDepsOptimizer: VitePlugin = {
  name: 'refraction:disable-client-deps-optimizer',
  configEnvironment(name, options) {
    if (name === 'client') {
      options.optimizeDeps = {
        ...options.optimizeDeps,
        include: [],
        noDiscovery: true,
      }
    }
  },
}

const config: ViteUserConfigFn = getViteConfig(
  {
    build: { target: 'esnext' },
    esbuild: { target: 'esnext' },
    css: {
      // The repo root's postcss.config.cjs wires Tailwind for Storybook with
      // a config path relative to the repo root; run from this package it
      // loads a broken Tailwind context and crashes on any `<style>` block.
      // Tests don't assert visuals — skip PostCSS entirely.
      postcss: { plugins: [] },
    },
    optimizeDeps: {
      esbuildOptions: { target: 'esnext' },
    },
    plugins: [disableClientDepsOptimizer],
    // `test` is Vitest's extension of the Vite config; `getViteConfig` types
    // the object as a plain Vite UserConfig.
    test: {
      environment: 'node',
      passWithNoTests: true,
      globalSetup: './__tests__/global-setup.ts',
    },
  } as ViteUserConfig,
  {
    // Belt and braces: also ask Astro to keep the dev toolbar out of
    // compiled `.astro` output.
    devToolbar: { enabled: false },
  }
)

export default config
