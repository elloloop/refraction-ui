/**
 * Minimal `.astro` module declaration so the meta entry can be typechecked
 * with plain `tsc`. The real component types come from the consumer's own
 * Astro toolchain (`astro check`); the meta only re-exports the adapters.
 */
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server'
  const component: AstroComponentFactory
  export default component
}
