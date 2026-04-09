#!/usr/bin/env node

/**
 * Package generator for refraction-ui monorepo.
 *
 * Usage:
 *   node scripts/generate-package.mjs <name> --type <core|react>
 *   node scripts/generate-package.mjs button --type core
 *   node scripts/generate-package.mjs react-button --type react --core button
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const args = process.argv.slice(2)
const name = args[0]
const typeIdx = args.indexOf('--type')
const type = typeIdx !== -1 ? args[typeIdx + 1] : 'core'
const coreIdx = args.indexOf('--core')
const coreName = coreIdx !== -1 ? args[coreIdx + 1] : null

if (!name) {
  console.error('Usage: generate-package.mjs <name> --type <core|react> [--core <core-pkg-name>]')
  process.exit(1)
}

const pkgDir = join(process.cwd(), 'packages', name)
if (existsSync(pkgDir)) {
  console.error(`Package directory already exists: packages/${name}`)
  process.exit(1)
}

const npmName = `@refraction-ui/${name}`

function generateCore() {
  const pkg = {
    name: npmName,
    version: '0.1.0',
    type: 'module',
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': { import: './dist/index.js', types: './dist/index.d.ts' },
    },
    files: ['dist'],
    scripts: {
      build: 'tsup',
      dev: 'tsup --watch',
      test: 'vitest run',
      'test:watch': 'vitest',
      'test:coverage': 'vitest run --coverage',
      typecheck: 'tsc --noEmit',
      lint: 'eslint src --ext .ts',
      clean: 'rm -rf dist',
    },
    dependencies: {
      '@refraction-ui/shared': 'workspace:*',
    },
    devDependencies: {},
    sideEffects: false,
    license: 'MIT',
  }

  const tsup = `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
})
`

  const tsconfig = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`

  const vitest = `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
`

  const index = `export {}\n`

  mkdirSync(join(pkgDir, 'src'), { recursive: true })
  mkdirSync(join(pkgDir, '__tests__'), { recursive: true })
  writeFileSync(join(pkgDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  writeFileSync(join(pkgDir, 'tsup.config.ts'), tsup)
  writeFileSync(join(pkgDir, 'tsconfig.json'), tsconfig)
  writeFileSync(join(pkgDir, 'vitest.config.ts'), vitest)
  writeFileSync(join(pkgDir, 'src', 'index.ts'), index)
}

function generateReact() {
  if (!coreName) {
    console.error('React packages require --core <name>')
    process.exit(1)
  }

  const pkg = {
    name: npmName,
    version: '0.1.0',
    type: 'module',
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': { import: './dist/index.js', types: './dist/index.d.ts' },
    },
    files: ['dist'],
    scripts: {
      build: 'tsup',
      dev: 'tsup --watch',
      test: 'vitest run',
      'test:watch': 'vitest',
      'test:coverage': 'vitest run --coverage',
      typecheck: 'tsc --noEmit',
      lint: 'eslint src --ext .ts,.tsx',
      clean: 'rm -rf dist',
    },
    dependencies: {
      [`@refraction-ui/${coreName}`]: 'workspace:*',
      '@refraction-ui/shared': 'workspace:*',
    },
    peerDependencies: {
      react: '>=18',
      'react-dom': '>=18',
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    sideEffects: false,
    license: 'MIT',
  }

  const tsup = `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
})
`

  const tsconfig = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
`

  const vitest = `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
  },
})
`

  const index = `export {}\n`

  mkdirSync(join(pkgDir, 'src'), { recursive: true })
  mkdirSync(join(pkgDir, '__tests__'), { recursive: true })
  writeFileSync(join(pkgDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  writeFileSync(join(pkgDir, 'tsup.config.ts'), tsup)
  writeFileSync(join(pkgDir, 'tsconfig.json'), tsconfig)
  writeFileSync(join(pkgDir, 'vitest.config.ts'), vitest)
  writeFileSync(join(pkgDir, 'src', 'index.ts'), index)
}

switch (type) {
  case 'core':
    generateCore()
    break
  case 'react':
    generateReact()
    break
  default:
    console.error(`Unknown type: ${type}. Use 'core' or 'react'.`)
    process.exit(1)
}

console.log(`✓ Created packages/${name} (${type})`)
