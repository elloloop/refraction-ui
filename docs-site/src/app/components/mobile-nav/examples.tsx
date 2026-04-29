'use client'

import { MobileNav, MobileNavTrigger, MobileNavContent, MobileNavLink } from '@refraction-ui/react-mobile-nav'

interface MobileNavExamplesProps {
  section: 'basic'
}

export function MobileNavExamples({ section }: MobileNavExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-sm mx-auto rounded-lg border overflow-hidden relative min-h-[300px] bg-background">
          <MobileNav>
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">My App</span>
              <MobileNavTrigger />
            </div>
            <MobileNavContent className="absolute top-[57px] left-0 w-full bg-background border-b z-10 shadow-sm">
              <div className="flex flex-col p-4 gap-2">
                <MobileNavLink href="#home">Home</MobileNavLink>
                <MobileNavLink href="#about">About</MobileNavLink>
                <MobileNavLink href="#services">Services</MobileNavLink>
                <MobileNavLink href="#contact">Contact</MobileNavLink>
              </div>
            </MobileNavContent>
          </MobileNav>
          <div className="p-4 text-sm text-muted-foreground">
            Page content goes here...
          </div>
        </div>
      </div>
    )
  }

  return null
}
