'use client'

import { DiffViewer, type DiffFile } from '@refraction-ui/react-diff-viewer'

const ORIGINAL = `export function greet(name) {
  return 'Hi ' + name
}
`

const MODIFIED = `export function greet(name: string): string {
  return \`Hello, \${name}!\`
}
`

const FILES: DiffFile[] = [
  { path: 'src/greet.ts', status: 'modified', additions: 2, deletions: 2 },
  { path: 'src/utils/format.ts', status: 'added', additions: 14, deletions: 0 },
  { path: 'src/legacy/old-greet.js', status: 'deleted', additions: 0, deletions: 9 },
]

interface DiffViewerExamplesProps {
  section: 'basic' | 'inline' | 'themes'
}

export function DiffViewerExamples({ section }: DiffViewerExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="h-[360px] overflow-hidden rounded-lg">
          <DiffViewer
            files={FILES}
            original={ORIGINAL}
            modified={MODIFIED}
            statusBarTitle="feature/typed-greeting"
            statusBarStatus="Ready"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Use <kbd className="rounded bg-muted px-1">j</kbd> /{' '}
          <kbd className="rounded bg-muted px-1">k</kbd> to move between files,{' '}
          <kbd className="rounded bg-muted px-1">b</kbd> to toggle the sidebar.
        </p>
      </div>
    )
  }

  if (section === 'inline') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="h-[300px] overflow-hidden rounded-lg">
          <DiffViewer
            files={FILES}
            original={ORIGINAL}
            modified={MODIFIED}
            viewMode="inline"
            showSidebar={false}
          />
        </div>
      </div>
    )
  }

  if (section === 'themes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="h-[300px] overflow-hidden rounded-lg">
          <DiffViewer
            files={[FILES[0]]}
            original={ORIGINAL}
            modified={MODIFIED}
            theme="light"
            monacoTheme="vs"
            showSidebar={false}
            showTabs={false}
          />
        </div>
      </div>
    )
  }

  return null
}
