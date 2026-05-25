// Turn the curated docs-site component examples into real React Storybook
// stories (one story per documented section), so components render with real
// props/content instead of empty baseline stubs. Then delete the auto-generated
// baseline package stories these replace (de-dupe by title).
//
// Run: node scripts/generate-docs-stories.mjs
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const compDir = path.join(root, 'docs-site/src/app/components')
const SKIP = new Set(['conversation']) // Chat already has a hand-written story

const pascal = (s) => s.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')

const generatedTitles = new Set()
let made = 0

for (const dir of fs.readdirSync(compDir)) {
  if (SKIP.has(dir)) continue
  const d = path.join(compDir, dir)
  const examplesPath = path.join(d, 'examples.tsx')
  const pagePath = path.join(d, 'page.tsx')
  if (!fs.existsSync(examplesPath)) continue

  const examplesSrc = fs.readFileSync(examplesPath, 'utf8')
  const expMatch = examplesSrc.match(/export function (\w+)/) || examplesSrc.match(/export const (\w+)\s*=/)
  if (!expMatch) continue
  const exportName = expMatch[1]
  const componentName = exportName.replace(/Examples?$/, '')
  const title = `Components/${componentName}`

  // Sections from page.tsx (the source of truth for valid section values).
  let sections = []
  if (fs.existsSync(pagePath)) {
    const page = fs.readFileSync(pagePath, 'utf8')
    sections = [...new Set([...page.matchAll(/section="([a-z0-9-]+)"/g)].map((m) => m[1]))]
  }
  const takesSection = /\bsection\b/.test(examplesSrc)
  if (sections.length === 0 && takesSection) sections = ['basic']

  let body
  if (sections.length === 0) {
    body = `export const Default = { render: () => <${exportName} /> }\n`
  } else {
    body = sections
      .map((s) => `export const ${pascal(s)} = { render: () => <${exportName} section="${s}" /> }`)
      .join('\n') + '\n'
  }

  const file = path.join(d, `${componentName}.stories.tsx`)
  fs.writeFileSync(
    file,
    `import { ${exportName} } from './examples'\n\n` +
      `// Generated from the docs-site example (curated, real props/content).\n` +
      `const meta = { title: '${title}' }\nexport default meta\n\n${body}`,
  )
  generatedTitles.add(title)
  made++
}

// De-dupe: delete auto-generated baseline package stories these replace.
let removed = 0
const pkgsDir = path.join(root, 'packages')
for (const folder of fs.readdirSync(pkgsDir)) {
  if (!folder.startsWith('react-')) continue
  const srcDir = path.join(pkgsDir, folder, 'src')
  if (!fs.existsSync(srcDir)) continue
  for (const f of fs.readdirSync(srcDir)) {
    if (!f.endsWith('.stories.tsx')) continue
    const p = path.join(srcDir, f)
    const src = fs.readFileSync(p, 'utf8')
    if (!src.includes('Auto-generated baseline story')) continue // keep hand-written
    const t = src.match(/title:\s*'([^']+)'/)?.[1]
    if (t && generatedTitles.has(t)) {
      fs.unlinkSync(p)
      removed++
    }
  }
}

console.log(`generated ${made} docs-example stories; removed ${removed} replaced baseline stories`)
