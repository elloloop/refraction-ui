import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../packages/react-*/src/**/*.stories.@(ts|tsx)',
    '../docs-site/src/app/components/**/*.stories.tsx',
  ],
  addons: [],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  // The repo's pinned esbuild can't lower modern syntax to Storybook's default
  // legacy browser targets, so build to esnext (this is a dev/test surface).
  async viteFinal(viteConfig) {
    viteConfig.build = { ...viteConfig.build, target: 'esnext' }
    // Force the automatic JSX runtime so files written without `import React`
    // (e.g. the reused docs-site examples) don't fail with "React is not defined".
    viteConfig.esbuild = { ...viteConfig.esbuild, target: 'esnext', jsx: 'automatic', jsxImportSource: 'react' }
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      esbuildOptions: { ...viteConfig.optimizeDeps?.esbuildOptions, target: 'esnext' },
    }
    return viteConfig
  },
}

export default config
