import Component from './FileTree.astro'

const meta = {
  title: 'Astro/FileTree',
  component: Component,
  argTypes: {
    nodes: { control: 'object' },
    expandedIds: { control: 'object' },
    selectedId: { control: 'text' },
  },
}

export default meta

// Nodes must match the headless core's FileTreeNode shape
// ({ id, label, children?, disabled? }) — see
// packages/file-tree/src/file-tree.ts.
export const Default = {
  args: {
    nodes: [
      {
        id: 'src',
        label: 'src',
        children: [
          {
            id: 'src-components',
            label: 'components',
            children: [
              { id: 'src-components-button', label: 'Button.tsx' },
              { id: 'src-components-input', label: 'Input.tsx' },
            ],
          },
          { id: 'src-index', label: 'index.ts' },
        ],
      },
      { id: 'package-json', label: 'package.json' },
    ],
    expandedIds: ['src', 'src-components'],
    selectedId: 'src-components-button',
  }
}
