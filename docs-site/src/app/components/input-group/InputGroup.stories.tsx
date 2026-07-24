import type { Meta, StoryObj } from '@storybook/react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
} from '@refraction-ui/react-input-group'

const meta: Meta<typeof InputGroup> = {
  title: 'Inputs/InputGroup',
  component: InputGroup,
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
}
export default meta

type Story = StoryObj<typeof InputGroup>

const inputClass =
  'flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground'

export const Addons: Story = {
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-4 w-full">
      <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <input className={inputClass} placeholder="0.00" inputMode="decimal" />
        <InputGroupText>USD</InputGroupText>
      </InputGroup>

      <InputGroup {...args}>
        <InputGroupAddon>@</InputGroupAddon>
        <input className={inputClass} placeholder="username" />
      </InputGroup>

      <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <input className={inputClass} placeholder="example.com" />
      </InputGroup>
    </div>
  ),
}

export const Buttons: Story = {
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-4 w-full">
      <InputGroup {...args}>
        <input className={inputClass} placeholder="Search…" type="search" />
        <InputGroupButton onClick={() => alert('Searching!')}>Search</InputGroupButton>
      </InputGroup>

      <InputGroup {...args}>
        <input className={inputClass} placeholder="you@example.com" type="email" />
        <InputGroupButton>Subscribe</InputGroupButton>
      </InputGroup>
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <InputGroup {...args} className="max-w-sm w-full">
      <input className={inputClass} placeholder="First name" />
      <input className={inputClass} placeholder="Last name" />
      <InputGroupButton orientation={args.orientation}>Save</InputGroupButton>
    </InputGroup>
  ),
}