// Separate Storybook for Astro components (framework: storybook-astro).
// Built/served independently from the React Storybook in ../.storybook.
const config = {
  stories: ['../packages/astro-*/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: { name: 'storybook-astro', options: {} },
  core: { builder: '@storybook/builder-vite', disableTelemetry: true },
  // Same esnext workaround as the React Storybook: the repo's pinned esbuild
  // can't lower modern syntax to Storybook's default legacy browser targets, so
  // force esnext across transform, build, and dep-optimization.
  async viteFinal(viteConfig: Record<string, any>) {
    viteConfig.build = { ...viteConfig.build, target: 'esnext' }
    viteConfig.esbuild = { ...viteConfig.esbuild, target: 'esnext' }
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      esbuildOptions: { ...viteConfig.optimizeDeps?.esbuildOptions, target: 'esnext' },
    }
    return viteConfig
  },
}

export default config
