import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@refraction-ui/react-button'

const meta: Meta<typeof Button> = {
  title: 'Inputs/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'xs'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    children: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    children: 'Save',
  },
  render: (args) => <Button {...args} />
}
