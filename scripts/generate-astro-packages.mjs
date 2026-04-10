#!/usr/bin/env node

/**
 * Generates all Astro package scaffolds for the refraction-ui monorepo.
 * Creates package.json + src/index.ts for each astro-* package,
 * plus the astro-meta package.
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT = new URL('..', import.meta.url).pathname

const COMPONENTS = [
  'ai', 'animated-text', 'app-shell', 'auth', 'avatar', 'avatar-group',
  'badge', 'bottom-nav', 'breadcrumbs', 'button', 'calendar', 'card',
  'charts', 'checkbox', 'code-editor', 'collapsible', 'command',
  'content-protection', 'data-table', 'date-picker', 'device-frame',
  'dialog', 'diff-viewer', 'dropdown-menu', 'emoji-picker',
  'feedback-dialog', 'file-upload', 'footer', 'inline-editor', 'input',
  'input-group', 'install-prompt', 'keyboard-shortcut', 'language-selector',
  'markdown-renderer', 'mobile-nav', 'navbar', 'otp-input', 'popover',
  'presence-indicator', 'progress-display', 'radio', 'reaction-bar',
  'resizable-layout', 'rich-editor', 'search-bar', 'select', 'sidebar',
  'skeleton', 'slide-viewer', 'status-indicator', 'switch', 'tabs',
  'textarea', 'theme', 'thread-view', 'toast', 'tooltip',
  'version-selector', 'video-player',
]

function createPackage(name) {
  const dir = join(ROOT, 'packages', `astro-${name}`)
  if (existsSync(dir)) {
    console.log(`  skip astro-${name} (exists)`)
    return
  }

  const pkg = {
    name: `@refraction-ui/astro-${name}`,
    version: '0.1.0',
    type: 'module',
    exports: {
      '.': './src/index.ts',
    },
    files: ['src'],
    dependencies: {
      [`@refraction-ui/${name}`]: 'workspace:*',
      '@refraction-ui/shared': 'workspace:*',
    },
    peerDependencies: {
      astro: '>=4.0.0',
    },
    sideEffects: false,
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'https://github.com/elloloop/refraction-ui.git',
      directory: `packages/astro-${name}`,
    },
    homepage: 'https://elloloop.github.io/refraction-ui/',
  }

  mkdirSync(join(dir, 'src'), { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  writeFileSync(join(dir, 'src', 'index.ts'), 'export {}\n')
  console.log(`  created astro-${name}`)
}

function createMetaPackage() {
  const dir = join(ROOT, 'packages', 'astro-meta')
  if (existsSync(dir)) {
    console.log('  skip astro-meta (exists)')
    return
  }

  const devDeps = {}
  for (const name of COMPONENTS) {
    devDeps[`@refraction-ui/astro-${name}`] = 'workspace:*'
  }
  devDeps['@refraction-ui/shared'] = 'workspace:*'

  const pkg = {
    name: '@refraction-ui/astro',
    version: '0.1.0',
    description: 'All Refraction UI Astro components in one package',
    type: 'module',
    exports: {
      '.': './src/index.ts',
    },
    files: ['src'],
    dependencies: {},
    peerDependencies: {
      astro: '>=4.0.0',
    },
    devDependencies: devDeps,
    publishConfig: {
      access: 'public',
    },
    sideEffects: false,
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/elloloop/refraction-ui.git',
      directory: 'packages/astro-meta',
    },
    homepage: 'https://elloloop.github.io/refraction-ui/',
  }

  mkdirSync(join(dir, 'src'), { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  writeFileSync(join(dir, 'src', 'index.ts'), 'export {}\n')
  console.log('  created astro-meta')
}

console.log('Generating Astro package scaffolds...')
for (const name of COMPONENTS) {
  createPackage(name)
}
createMetaPackage()
console.log(`\nDone! Created ${COMPONENTS.length} component packages + astro-meta.`)
console.log('Run: pnpm install')
