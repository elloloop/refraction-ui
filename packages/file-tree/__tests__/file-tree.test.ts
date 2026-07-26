import { describe, it, expect, vi } from 'vitest'
import { createFileTree, type FileTreeNode } from '../src/index.js'

const NODES: FileTreeNode[] = [
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

const ids = (items: { node: FileTreeNode }[]) => items.map((i) => i.node.id)

describe('createFileTree (visibility)', () => {
  it('lists only roots when fully collapsed', () => {
    const api = createFileTree({ nodes: NODES })
    expect(ids(api.getVisibleItems())).toEqual(['src', 'package.json', 'README.md'])
  })

  it('expands/collapses parents, revealing children in DFS order', () => {
    const api = createFileTree({ nodes: NODES, defaultExpandedIds: ['src'] })
    expect(ids(api.getVisibleItems())).toEqual([
      'src',
      'src/index.ts',
      'src/components',
      'package.json',
      'README.md',
    ])

    api.expand('src/components')
    expect(ids(api.getVisibleItems())).toEqual([
      'src',
      'src/index.ts',
      'src/components',
      'src/components/button.tsx',
      'src/components/input.tsx',
      'package.json',
      'README.md',
    ])

    api.collapse('src')
    expect(ids(api.getVisibleItems())).toEqual(['src', 'package.json', 'README.md'])
  })

  it('tracks depth and parent ids', () => {
    const api = createFileTree({ nodes: NODES, defaultExpandedIds: ['src', 'src/components'] })
    const button = api.getVisibleItems().find((i) => i.node.id === 'src/components/button.tsx')!
    expect(button.depth).toBe(3)
    expect(button.parentId).toBe('src/components')
    expect(button.hasChildren).toBe(false)
  })

  it('toggle no-ops on leaves and unknown ids', () => {
    const onExpandedChange = vi.fn()
    const api = createFileTree({ nodes: NODES, onExpandedChange })
    api.toggle('package.json')
    api.toggle('nope')
    expect(api.getState().expandedIds).toEqual([])
    expect(onExpandedChange).not.toHaveBeenCalled()
  })

  it('reports expansion changes and supports a controlled expanded set', () => {
    const onExpandedChange = vi.fn()
    const api = createFileTree({ nodes: NODES, expandedIds: [], onExpandedChange })
    api.expand('src')
    // Controlled: state does not change until the consumer syncs it.
    expect(api.getState().expandedIds).toEqual([])
    expect(onExpandedChange).toHaveBeenCalledWith(['src'])
    api.setExpandedIds(['src'])
    expect(api.isExpanded('src')).toBe(true)
  })
})

describe('createFileTree (selection)', () => {
  it('selects and clears nodes', () => {
    const api = createFileTree({ nodes: NODES })
    api.select('package.json')
    expect(api.getState().selectedId).toBe('package.json')
    api.select(null)
    expect(api.getState().selectedId).toBeNull()
  })

  it('rejects unknown and disabled nodes', () => {
    const api = createFileTree({
      nodes: [{ id: 'locked', label: 'locked', disabled: true }],
    })
    api.select('locked')
    api.select('nope')
    expect(api.getState().selectedId).toBeNull()
  })

  it('supports controlled selection', () => {
    const onSelectionChange = vi.fn()
    const api = createFileTree({ nodes: NODES, selectedId: null, onSelectionChange })
    api.select('README.md')
    expect(api.getState().selectedId).toBeNull()
    expect(onSelectionChange).toHaveBeenCalledWith('README.md')
    api.setSelectedId('README.md')
    expect(api.getState().selectedId).toBe('README.md')
  })
})

describe('createFileTree (keyboard)', () => {
  it('moves focus with arrows and Home/End over visible rows', () => {
    const api = createFileTree({ nodes: NODES, defaultExpandedIds: ['src'] })
    api.handleKey('ArrowDown')
    expect(api.getState().focusedId).toBe('src')
    api.handleKey('ArrowDown')
    expect(api.getState().focusedId).toBe('src/index.ts')
    api.handleKey('ArrowUp')
    expect(api.getState().focusedId).toBe('src')
    api.handleKey('End')
    expect(api.getState().focusedId).toBe('README.md')
    api.handleKey('Home')
    expect(api.getState().focusedId).toBe('src')
  })

  it('ArrowRight expands a closed parent, then descends to the first child', () => {
    const api = createFileTree({ nodes: NODES })
    api.focus('src')
    api.handleKey('ArrowRight')
    expect(api.isExpanded('src')).toBe(true)
    expect(api.getState().focusedId).toBe('src')
    api.handleKey('ArrowRight')
    expect(api.getState().focusedId).toBe('src/index.ts')
    // Leaf: no-op.
    api.handleKey('ArrowRight')
    expect(api.getState().focusedId).toBe('src/index.ts')
  })

  it('ArrowLeft collapses an open parent, then ascends to the parent', () => {
    const api = createFileTree({ nodes: NODES, defaultExpandedIds: ['src'] })
    api.focus('src')
    api.handleKey('ArrowLeft')
    expect(api.isExpanded('src')).toBe(false)

    // On a closed (or leaf) child, ArrowLeft ascends to its parent.
    api.expand('src')
    api.focus('src/components')
    api.handleKey('ArrowLeft')
    expect(api.getState().focusedId).toBe('src')
  })

  it('Enter and Space select the focused node', () => {
    const api = createFileTree({ nodes: NODES })
    api.focus('package.json')
    api.handleKey('Enter')
    expect(api.getState().selectedId).toBe('package.json')
    api.focus('README.md')
    api.handleKey(' ')
    expect(api.getState().selectedId).toBe('README.md')
  })

  it('ignores unhandled keys', () => {
    const api = createFileTree({ nodes: NODES })
    api.focus('src')
    api.handleKey('Tab')
    expect(api.getState().focusedId).toBe('src')
  })
})

describe('createFileTree (aria)', () => {
  it('exposes tree/treeitem ARIA', () => {
    const api = createFileTree({ nodes: NODES, defaultExpandedIds: ['src'] })
    expect(api.getTreeAria().role).toBe('tree')
    expect(api.getTreeAria()['aria-label']).toBe('File tree')

    const [root, child] = api.getVisibleItems()
    expect(api.getItemAria(root!)).toMatchObject({
      role: 'treeitem',
      'aria-level': 1,
      'aria-expanded': true,
      'aria-selected': false,
    })
    // Leaves carry no aria-expanded.
    expect(api.getItemAria(child!)['aria-expanded']).toBeUndefined()
    expect(api.getItemAria(child!)['aria-level']).toBe(2)
  })

  it('marks disabled nodes with aria-disabled', () => {
    const api = createFileTree({ nodes: [{ id: 'a', label: 'a', disabled: true }] })
    const [item] = api.getVisibleItems()
    expect(api.getItemAria(item!)['aria-disabled']).toBe(true)
  })
})

describe('createFileTree (subscription)', () => {
  it('notifies on changes and stops after unsubscribe', () => {
    const listener = vi.fn()
    const api = createFileTree({ nodes: NODES })
    const unsubscribe = api.subscribe(listener)
    api.expand('src')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    api.collapse('src')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('setNodes replaces the model and reindexes', () => {
    const api = createFileTree({ nodes: [] })
    expect(api.getVisibleItems()).toEqual([])
    api.setNodes(NODES)
    expect(ids(api.getVisibleItems())).toEqual(['src', 'package.json', 'README.md'])
    api.select('README.md')
    expect(api.getState().selectedId).toBe('README.md')
  })
})
