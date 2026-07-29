import Component from './DiffViewer.astro'

const meta = {
  title: 'Astro/DiffViewer',
  component: Component,
}

export default meta

const ORIGINAL = `export function greet(name) {
  return 'Hi ' + name
}
`

const MODIFIED = `export function greet(name: string): string {
  return \`Hello, \${name}!\`
}
`

// Files must match the headless core's DiffFile shape
// ({ path, status, additions, deletions, diff?, oldPath? }) — see
// packages/diff-viewer/src/diff-viewer.ts.
export const Default = {
  args: {
    files: [
      { path: 'src/greet.ts', status: 'modified', additions: 2, deletions: 2 },
      { path: 'src/utils/format.ts', status: 'added', additions: 14, deletions: 0 },
      { path: 'src/legacy/old-greet.js', status: 'deleted', additions: 0, deletions: 9 }
    ],
    original: ORIGINAL,
    modified: MODIFIED,
    language: 'typescript',
    theme: 'dark',
    viewMode: 'side-by-side',
    showSidebar: true,
    showTabs: true,
    showStatusBar: true,
    sidebarWidth: 220,
    activeFileIndex: 0,
    statusBarTitle: 'feature/typed-greeting',
    statusBarStatus: 'Ready'
  }
}
