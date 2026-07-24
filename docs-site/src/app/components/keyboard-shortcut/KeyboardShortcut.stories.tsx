import type { Meta, StoryObj } from '@storybook/react'
import { ShortcutBadge } from '@refraction-ui/react-keyboard-shortcut'

const meta: Meta<typeof ShortcutBadge> = {
  title: 'Utilities/KeyboardShortcut',
  component: ShortcutBadge,
  args: {
    keys: ['Cmd', 'K'],
  },
  argTypes: {
    keys: { control: 'object' },
  },
}
export default meta

type Story = StoryObj<typeof ShortcutBadge>

export const Default: Story = {
  render: (args) => <ShortcutBadge {...args} />,
}

export const MultipleVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex flex-col items-center gap-2.5">
        <ShortcutBadge keys={['Cmd', 'K']} />
        <span className="text-xs text-muted-foreground font-medium">Command Palette</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <ShortcutBadge keys={['Ctrl', 'S']} />
        <span className="text-xs text-muted-foreground font-medium">Save</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <ShortcutBadge keys={['Ctrl', 'Shift', 'P']} />
        <span className="text-xs text-muted-foreground font-medium">Command</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <ShortcutBadge keys={['Esc']} />
        <span className="text-xs text-muted-foreground font-medium">Close</span>
      </div>
    </div>
  ),
}