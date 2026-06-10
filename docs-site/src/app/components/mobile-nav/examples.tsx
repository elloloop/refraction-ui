'use client'

import { useState } from 'react'
import {
  MobileNav,
  MobileNavTrigger,
  MobileNavContent,
  MobileNavLink,
} from '@refraction-ui/react-mobile-nav'

interface MobileNavExamplesProps {
  section: 'basic' | 'controlled'
}

const links = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
]

export function MobileNavExamples({ section }: MobileNavExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <MobileNav defaultOpen className="max-w-xs">
          <MobileNavTrigger />
          <MobileNavContent>
            {links.map((l) => (
              <MobileNavLink key={l.href} href={l.href}>
                {l.label}
              </MobileNavLink>
            ))}
          </MobileNavContent>
        </MobileNav>
      </div>
    )
  }

  if (section === 'controlled') {
    return <ControlledExample />
  }

  return null
}

function ControlledExample() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <MobileNav open={open} onOpenChange={setOpen} className="max-w-xs">
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
}
