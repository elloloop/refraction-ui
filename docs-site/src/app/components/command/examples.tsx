'use client'

import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@refraction-ui/react-command'

interface CommandExamplesProps {
  section: 'basic'
}

export function CommandExamples({ section }: CommandExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-md">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem onSelect={() => alert('Calendar')}>Calendar</CommandItem>
                <CommandItem onSelect={() => alert('Search')}>Search</CommandItem>
                <CommandItem onSelect={() => alert('Settings')}>Settings</CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => alert('New File')}>New File</CommandItem>
                <CommandItem onSelect={() => alert('New Folder')}>New Folder</CommandItem>
                <CommandItem disabled>Disabled Action</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </div>
    )
  }

  return null
}
