import type { Meta, StoryObj } from '@storybook/react'
import { FileTree, type FileTreeNode } from '@refraction-ui/react-file-tree'

const meta: Meta<typeof FileTree> = {
  title: 'Data Display/FileTree',
  component: FileTree,
  parameters: {
    layout: 'centered',
  },
  args: {
    defaultExpandedIds: ['src'],
  },
  argTypes: {
    onExpandedChange: { action: 'expandedChange' },
    onSelectionChange: { action: 'selectionChange' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

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

export const Default: Story = {
  args: {
    nodes: SAMPLE,
    defaultSelectedId: 'package.json',
  },
  render: (args) => (
    <div className="w-72">
      <FileTree {...args} />
    </div>
  ),
}
