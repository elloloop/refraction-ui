'use client'

import { FileTree, type FileTreeNode } from '@refraction-ui/react-file-tree'

const SAMPLE: FileTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/index.ts', label: 'index.ts' },
      {
        id: 'src/components',
        label: 'components',
        children: [
          { id: 'src/components/button.tsx', label: 'button.tsx' },
          { id: 'src/components/input.tsx', label: 'input.tsx' },
        ],
      },
    ],
  },
  { id: 'package.json', label: 'package.json' },
  { id: 'README.md', label: 'README.md' },
]

interface FileTreeExamplesProps {
  section: 'basic'
}

export function FileTreeExamples({ section }: FileTreeExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <FileTree
          nodes={SAMPLE}
          defaultExpandedIds={['src']}
          defaultSelectedId="package.json"
          className="max-w-sm"
        />
      </div>
    )
  }

  return null
}
