import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarImage, AvatarFallback } from '@refraction-ui/react-avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar',
  component: Avatar,
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: { size: 'md' },
  render: (args) => (
    <div className="flex gap-4">
      <Avatar {...args}>
        <AvatarImage src="https://i.pravatar.cc/150?u=a" alt="User avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  )
}
