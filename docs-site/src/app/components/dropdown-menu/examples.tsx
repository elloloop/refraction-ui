'use client'

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@refraction-ui/react-dropdown-menu'
import { Button } from '@refraction-ui/react-button'

interface DropdownMenuExamplesProps {
  section: 'basic'
}

export function DropdownMenuExamples({ section }: DropdownMenuExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <DropdownMenu>
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
        </div>
      </div>
    )
  }

  return null
}
