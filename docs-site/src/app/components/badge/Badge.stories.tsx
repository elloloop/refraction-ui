import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@refraction-ui/react-badge'

const meta: Meta<typeof Badge> = {
  title: 'Data Display/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'destructive', 'outline', 'success', 'warning', 'tertiary', 'positive', 'caution', 'done'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    children: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
    children: 'Badge Label',
  },
  render: (args) => <Badge {...args} />
}

// Issue #485 — second brand accent + extended status roles.
export const Tertiary: Story = {
  args: { variant: 'tertiary', size: 'md', children: 'Tertiary' },
  render: (args) => <Badge {...args} />,
}

export const Positive: Story = {
  args: { variant: 'positive', size: 'md', children: 'Positive' },
  render: (args) => <Badge {...args} />,
}

export const Done: Story = {
  args: { variant: 'done', size: 'md', children: 'Done' },
  render: (args) => <Badge {...args} />,
}
