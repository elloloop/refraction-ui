import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@refraction-ui/react-button'

const meta: Meta<typeof Button> = {
  title: 'Inputs/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'destructive', 'outline', 'secondary', 'soft', 'tertiary', 'ghost', 'link'],
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

// Issue #485 — soft tinted brand fill + a real second brand accent.
export const Soft: Story = {
  args: { variant: 'soft', children: 'Soft' },
  render: (args) => <Button {...args} />,
}

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'Tertiary' },
  render: (args) => <Button {...args} />,
}
