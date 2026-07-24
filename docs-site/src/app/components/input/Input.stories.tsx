import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '@refraction-ui/react-input'

const meta: Meta<typeof Input> = {
  title: 'Inputs/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  args: {
    type: 'text',
    placeholder: 'Enter text',
    disabled: false,
    readOnly: false,
    required: false,
    size: 'default',
  },
  argTypes: {
    type: { 
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'] 
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg']
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Input {...args} />
    </div>
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <div className="w-80 space-y-2">
      <Input {...args} aria-invalid={true} />
      <p className="text-xs text-destructive/80">This field has a validation error.</p>
    </div>
  ),
  args: {
    placeholder: 'Invalid input',
  }
}
