// `.astro` single-file components have no wildcard surface — re-export the
// default export by name. (The astro-meta build used to paper over the broken
// `export * from './astro-file-tree'` by rewriting it to exactly this.)
export { default as FileTree } from './astro-file-tree.astro'
