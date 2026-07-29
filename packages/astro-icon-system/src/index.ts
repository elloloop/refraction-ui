// `.astro` single-file components have no wildcard surface — re-export the
// default export by name. (The astro-meta build used to paper over the broken
// `export * from './astro-icon-system'` by rewriting it to exactly this.)
export { default as IconSystem } from './astro-icon-system.astro'
