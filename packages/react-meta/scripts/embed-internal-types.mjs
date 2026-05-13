import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(packageDir, '..', '..')
const distDir = resolve(packageDir, 'dist')
const internalDir = resolve(distDir, 'internal')
const selfPackageName = '@refraction-ui/react'
const packageSpecifierPattern = /(['"])@refraction-ui\/([a-z0-9-]+)\1/g
const entryDeclarationProxies = [
  ['form.d.ts', '@refraction-ui/react-form'],
  ['form.d.cts', '@refraction-ui/react-form'],
  ['theme.d.ts', '@refraction-ui/react-theme'],
  ['theme.d.cts', '@refraction-ui/react-theme'],
]

const copied = new Set()
const queued = []

async function pathExists(path) {
  try {
    await readdir(path)
    return true
  } catch {
    return false
  }
}

async function listDeclarationFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listDeclarationFiles(path)))
      continue
    }

    if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.cts')) {
      files.push(path)
    }
  }

  return files
}

function toSpecifier(fromFile, packageName) {
  const extension = fromFile.endsWith('.d.cts') ? '.cjs' : '.js'
  const target = resolve(internalDir, packageName, `index${extension}`)
  let specifier = relative(dirname(fromFile), target).replaceAll('\\', '/')

  if (!specifier.startsWith('.')) {
    specifier = `./${specifier}`
  }

  return specifier
}

function queuePackage(packageName) {
  if (packageName === selfPackageName || copied.has(packageName)) {
    return
  }

  if (!queued.includes(packageName)) {
    queued.push(packageName)
  }
}

async function rewriteDeclarationFile(path) {
  const original = await readFile(path, 'utf8')
  const rewritten = original.replace(
    packageSpecifierPattern,
    (match, quote, localName) => {
      const packageName = `@refraction-ui/${localName}`
      queuePackage(packageName)
      return `${quote}${toSpecifier(path, localName)}${quote}`
    }
  )

  if (rewritten !== original) {
    await writeFile(path, rewritten)
  }
}

async function writeEntryDeclarationProxy(fileName, packageName) {
  const file = resolve(distDir, fileName)
  const localName = packageName.replace('@refraction-ui/', '')

  queuePackage(packageName)
  await writeFile(file, `export * from '${toSpecifier(file, localName)}';\n`)
}

async function copyPackageDeclarations(packageName) {
  const localName = packageName.replace('@refraction-ui/', '')
  const sourceDir = resolve(repoRoot, 'packages', localName, 'dist')
  const targetDir = resolve(internalDir, localName)

  if (!(await pathExists(sourceDir))) {
    throw new Error(`Missing declaration source for ${packageName}: ${sourceDir}`)
  }

  await mkdir(targetDir, { recursive: true })

  for (const file of await listDeclarationFiles(sourceDir)) {
    const target = resolve(targetDir, relative(sourceDir, file))
    await mkdir(dirname(target), { recursive: true })
    await cp(file, target)
  }

  copied.add(packageName)

  for (const file of await listDeclarationFiles(targetDir)) {
    await rewriteDeclarationFile(file)
  }
}

for (const [fileName, packageName] of entryDeclarationProxies) {
  await writeEntryDeclarationProxy(fileName, packageName)
}

for (const file of await listDeclarationFiles(distDir)) {
  if (!file.includes(`${internalDir}/`)) {
    await rewriteDeclarationFile(file)
  }
}

while (queued.length > 0) {
  const packageName = queued.shift()
  if (copied.has(packageName)) {
    continue
  }

  await copyPackageDeclarations(packageName)
}
