import type { Meta, StoryObj } from '@storybook/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@refraction-ui/react-dropdown-menu'
import { Button } from '@refraction-ui/react-button'

const meta: Meta<typeof DropdownMenu> = {
  title: 'Overlays/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  args: {
    defaultOpen: false,
    modal: true,
  },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    modal: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => alert('Profile')}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => alert('Settings')}>Settings</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => alert('Billing')}>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => alert('Logout')}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
