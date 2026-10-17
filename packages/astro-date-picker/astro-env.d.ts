/**
 * Lets `tsc` check `src/index.ts`, which re-exports `DatePicker.astro`. The
 * component's own types come from the consumer's Astro toolchain.
 */
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server'
  const component: AstroComponentFactory
  export default component
}
