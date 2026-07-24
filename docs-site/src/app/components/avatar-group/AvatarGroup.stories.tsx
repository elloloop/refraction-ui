import type { Meta, StoryObj } from '@storybook/react'
import { AvatarGroup } from '@refraction-ui/react-avatar-group'

const meta: Meta<typeof AvatarGroup> = {
  title: 'Data Display/AvatarGroup',
  component: AvatarGroup,
  argTypes: {
    max: { control: 'number' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
}
export default meta
type Story = StoryObj<typeof AvatarGroup>

export const Default: Story = {
  args: {
    max: 4,
    size: 'md',
    users: [
      { id: '1', name: 'Alice Johnson', src: 'https://i.pravatar.cc/150?u=a' },
      { id: '2', name: 'Bob Smith', src: 'https://i.pravatar.cc/150?u=b' },
      { id: '3', name: 'Carol White', src: 'https://i.pravatar.cc/150?u=c' },
      { id: '4', name: 'Dave Brown' },
      { id: '5', name: 'Eve Davis' },
    ]
  },
  render: (args) => <AvatarGroup {...args} />
}
