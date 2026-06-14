import type { Meta, StoryObj } from '@storybook/react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@refraction-ui/react-command'

const meta: Meta<typeof Command> = {
  title: 'Components/Command',
  component: Command,
  argTypes: {},
}

export default meta

type Story = StoryObj<typeof Command>

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md">
      <Command className="rounded-lg border shadow-md" {...args}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem>New File</CommandItem>
            <CommandItem>New Folder</CommandItem>
            <CommandItem disabled>Disabled Action</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
}
