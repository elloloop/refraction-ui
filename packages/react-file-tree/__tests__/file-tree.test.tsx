import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { FileTree, type FileTreeNode } from '../src/react-file-tree.js'

const NODES: FileTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/index.ts', label: 'index.ts' },
      {
        id: 'src/components',
        label: 'components',
        children: [{ id: 'src/components/button.tsx', label: 'button.tsx' }],
      },
    ],
  },
  { id: 'package.json', label: 'package.json' },
]

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(FileTree, props))

describe('FileTree (SSR)', () => {
  it('renders a tree landmark with only root rows when collapsed', () => {
    const html = render({ nodes: NODES })
    expect(html).toContain('role="tree"')
    expect(html).toContain('aria-label="File tree"')
    expect((html.match(/role="treeitem"/g) ?? []).length).toBe(2)
    expect(html).toContain('src')
    expect(html).toContain('package.json')
    expect(html).not.toContain('index.ts')
  })

  it('renders expanded groups with nested treeitems and aria-level', () => {
    const html = render({ nodes: NODES, defaultExpandedIds: ['src', 'src/components'] })
    expect((html.match(/role="treeitem"/g) ?? []).length).toBe(5)
    expect((html.match(/role="group"/g) ?? []).length).toBe(2)
    expect(html).toContain('button.tsx')
    expect(html).toContain('aria-level="3"')
    expect(html).toContain('aria-expanded="true"')
  })

  it('marks collapsed parents with aria-expanded="false" and leaves without it', () => {
    const html = render({ nodes: NODES })
    expect(html).toContain('aria-expanded="false"')
    // The leaf (package.json) must not carry aria-expanded.
    const leaf = html.slice(html.indexOf('package.json') - 300, html.indexOf('package.json'))
    expect(leaf).not.toContain('aria-expanded')
  })

  it('marks the selected row and gives the first row the roving tab stop', () => {
    const html = render({ nodes: NODES, defaultSelectedId: 'package.json' })
    expect((html.match(/aria-selected="true"/g) ?? []).length).toBe(1)
    expect((html.match(/tabindex="0"/g) ?? []).length).toBe(1)
    expect((html.match(/tabindex="-1"/g) ?? []).length).toBe(1)
  })

  it('renders an empty tree for no nodes and forwards className', () => {
    const html = render({ className: 'my-tree' })
    expect(html).toContain('role="tree"')
    expect(html).toContain('my-tree')
    expect(html).not.toContain('role="treeitem"')
  })
})
