import type { Meta, StoryObj } from '@storybook/react'
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

const meta: Meta<typeof DiffViewer> = {
  title: 'Components/DiffViewer',
  component: DiffViewer,
  argTypes: {
    viewMode: { control: 'radio', options: ['split', 'inline'] },
    theme: { control: 'radio', options: ['light', 'dark'] },
    showSidebar: { control: 'boolean' },
    showTabs: { control: 'boolean' },
  },
  args: {
    files: FILES,
    original: ORIGINAL,
    modified: MODIFIED,
    statusBarTitle: "feature/typed-greeting",
    statusBarStatus: "Ready",
  },
}

export default meta

type Story = StoryObj<typeof DiffViewer>

export const Default: Story = {
  render: (args) => (
    <div className="h-[360px] overflow-hidden rounded-lg">
      <DiffViewer {...args} />
    </div>
  ),
}

export const Inline: Story = {
  args: {
    viewMode: 'inline',
    showSidebar: false,
  },
  render: (args) => (
    <div className="h-[300px] overflow-hidden rounded-lg">
      <DiffViewer {...args} />
    </div>
  ),
}

export const LightTheme: Story = {
  args: {
    theme: 'light',
    monacoTheme: 'vs',
    showSidebar: false,
    showTabs: false,
  },
  render: (args) => (
    <div className="h-[300px] overflow-hidden rounded-lg">
      <DiffViewer {...args} files={[FILES[0]]} />
    </div>
  ),
}
