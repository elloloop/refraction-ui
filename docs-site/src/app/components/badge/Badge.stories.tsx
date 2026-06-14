import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@refraction-ui/react-badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'destructive', 'outline', 'success', 'warning'],
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
