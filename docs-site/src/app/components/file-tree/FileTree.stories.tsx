import type { Meta, StoryObj } from '@storybook/react'
import { FileTree } from '@refraction-ui/react-file-tree'

const meta: Meta<typeof FileTree> = {
  title: 'Data Display/FileTree',
  component: FileTree,
  parameters: {
    layout: 'centered',
  },
  args: {
  },
  argTypes: {
  },
}

export default meta
type Story = StoryObj<typeof meta>

// The FileTree component is an early-stage primitive. We render a small
// representative tree alongside the live component so the page documents the
// intended shape; the live <FileTree /> renders its (currently minimal) output.
interface TreeNode {
  name: string
  children?: TreeNode[]
}

const SAMPLE: TreeNode[] = [
  {
    name: 'src',
    children: [
      { name: 'index.ts' },
      {
        name: 'components',
        children: [{ name: 'button.tsx' }, { name: 'input.tsx' }],
      },
    ],
  },
  { name: 'package.json' },
  { name: 'README.md' },
]

function Tree({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.name}>
          <div
            className="flex items-center gap-1.5 text-sm text-foreground"
            style={{ paddingLeft: depth * 16 }}
          >
            <span className="text-muted-foreground">{node.children ? '▸' : '·'}</span>
            <span className={node.children ? 'font-medium' : 'text-muted-foreground'}>{node.name}</span>
          </div>
          {node.children ? <Tree nodes={node.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  )
}

export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Tree nodes={SAMPLE} />
      <FileTree {...args} />
    </div>
  ),
}
