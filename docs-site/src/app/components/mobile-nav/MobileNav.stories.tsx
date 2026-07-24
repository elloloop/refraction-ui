import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  MobileNav,
  MobileNavTrigger,
  MobileNavContent,
  MobileNavLink,
} from '@refraction-ui/react-mobile-nav'

const meta: Meta<typeof MobileNav> = {
  title: 'Navigation/MobileNav',
  component: MobileNav,
  args: {
    defaultOpen: false,
    className: 'max-w-xs',
  },
  argTypes: {
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    className: { control: 'text' },
    onOpenChange: { action: 'open changed' },
  },
}
export default meta

type Story = StoryObj<typeof MobileNav>

const links = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
]

export const Default: Story = {
  args: {
    defaultOpen: true,
  },
  render: (args) => (
    <MobileNav {...args}>
      <MobileNavTrigger />
      <MobileNavContent>
        {links.map((l) => (
          <MobileNavLink key={l.href} href={l.href}>
            {l.label}
          </MobileNavLink>
        ))}
      </MobileNavContent>
    </MobileNav>
  ),
}

export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <div className="w-full max-w-xs">
        <MobileNav 
          {...args} 
          open={args.open !== undefined ? args.open : open} 
          onOpenChange={(v) => {
            setOpen(v)
            args.onOpenChange?.(v)
          }}
        >
          <MobileNavTrigger />
          <MobileNavContent>
            {links.map((l) => (
              <MobileNavLink key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </MobileNavLink>
            ))}
          </MobileNavContent>
        </MobileNav>
        <p className="mt-4 text-sm text-muted-foreground">
          Menu is <code className="rounded bg-muted px-1 font-mono text-xs">{open ? 'open' : 'closed'}</code>
        </p>
      </div>
    )
  },
}