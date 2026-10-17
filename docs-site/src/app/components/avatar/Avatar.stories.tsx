import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarImage, AvatarFallback } from '@refraction-ui/react-avatar'
import { AvatarExamples } from './examples'

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar',
  component: Avatar,
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
    },
    presence: {
      control: 'select',
      options: [undefined, 'online', 'away', 'busy', 'dnd', 'offline'],
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

export const FailedImage: Story = {
  args: { size: 'md' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="data:image/png;base64,invalid" alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

/** A presence dot on each status, every size and a square avatar. */
export const Presence: Story = {
  render: () => <AvatarExamples section="presence" />,
}

/** One avatar with presence, to try the controls on. */
export const PresencePlayground: Story = {
  args: { size: 'lg', shape: 'circle', presence: 'online', 'aria-label': 'Ada Lovelace' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
}
