// Generate baseline Storybook stories for every react-* component package.
//
// Safety-first: each story does `import * as Pkg from './index.js'` (which can
// never produce a missing-export type error) and renders the package's primary
// component inside an error boundary. Components that need props show a graceful
// "pass props" card instead of crashing Storybook or breaking `make ci`.
//
// Packages that already have a hand-written *.stories.tsx are left untouched.
// Run: node scripts/generate-stories.mjs
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const pkgsDir = path.join(root, 'packages')

// Non-visual / special packages to skip.
const DENY = new Set(['react-meta'])

/** react-data-table -> DataTable */
function pascal(folder) {
  return folder
    .replace(/^react-/, '')
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

let created = 0
let skipped = 0

for (const folder of fs.readdirSync(pkgsDir)) {
  if (!folder.startsWith('react-') || DENY.has(folder)) continue
  const srcDir = path.join(pkgsDir, folder, 'src')
  if (!fs.existsSync(path.join(srcDir, 'index.ts'))) continue

  // Skip packages that already have any story (hand-written or generated).
  const hasStory = fs.readdirSync(srcDir).some((f) => f.endsWith('.stories.tsx'))
  if (hasStory) {
    skipped++
    continue
  }

  const name = pascal(folder)
  const title = `Components/${name}`
  const file = path.join(srcDir, `${name}.stories.tsx`)
  const content = `import * as React from 'react'
import * as Pkg from './index.js'

// Auto-generated baseline story. Renders the primary component with no props;
// components that require props show a graceful card (enrich by hand as needed).
const COMPONENT = '${name}'
const exported = Pkg as Record<string, unknown>
const Cmp = (exported[COMPONENT] ??
  Object.values(exported).find(
    (v) => typeof v === 'function' || (v !== null && typeof v === 'object' && '$$typeof' in (v as object)),
  )) as React.ComponentType<Record<string, unknown>> | undefined

class Boundary extends React.Component<{ children: React.ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() {
    return { err: true }
  }
  render() {
    if (this.state.err) {
      return (
        <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
          <strong>{COMPONENT}</strong> needs props to preview. See the docs site for a full example.
        </div>
      )
    }
    return this.props.children
  }
}

export default { title: '${title}' }

export const Default = {
  render: () => (
    <div className="p-6">
      <Boundary>{Cmp ? <Cmp /> : <em className="text-muted-foreground">No renderable export found.</em>}</Boundary>
    </div>
  ),
}
`
  fs.writeFileSync(file, content)
  created++
}

console.log(`generated ${created} baseline stories, skipped ${skipped} (already had stories)`)
