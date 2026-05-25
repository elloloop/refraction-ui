// Generate baseline storybook-astro stories for every astro-* component package.
//
// Each story imports the package's primary .astro component and renders it with
// empty args. Components that require props will show a render error in the
// canvas (baseline coverage) — enrich those by hand. Packages that already have
// a *.stories.ts are left untouched.
// Run: node scripts/generate-astro-stories.mjs
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const pkgsDir = path.join(root, 'packages')
const DENY = new Set(['astro-meta'])

/** astro-thread-view -> ThreadView */
function pascal(folder) {
  return folder
    .replace(/^astro-/, '')
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

let created = 0
let skipped = 0

for (const folder of fs.readdirSync(pkgsDir)) {
  if (!folder.startsWith('astro-') || DENY.has(folder)) continue
  const srcDir = path.join(pkgsDir, folder, 'src')
  if (!fs.existsSync(srcDir)) continue

  const astroFiles = fs.readdirSync(srcDir).filter((f) => f.endsWith('.astro'))
  if (astroFiles.length === 0) continue
  if (fs.readdirSync(srcDir).some((f) => f.endsWith('.stories.ts') || f.endsWith('.stories.tsx'))) {
    skipped++
    continue
  }

  const name = pascal(folder)
  // Prefer the .astro matching the package name; else the first one.
  const primary = astroFiles.find((f) => f === `${name}.astro`) ?? astroFiles[0]
  const file = path.join(srcDir, `${name}.stories.ts`)
  const content = `import Component from './${primary}'

// Auto-generated baseline story. Renders the component with empty args;
// components that require props show a render error (enrich by hand as needed).
const meta = {
  title: 'Astro/${name}',
  component: Component,
}

export default meta

export const Default = { args: {} }
`
  fs.writeFileSync(file, content)
  created++
}

console.log(`generated ${created} astro stories, skipped ${skipped} (already had stories)`)
