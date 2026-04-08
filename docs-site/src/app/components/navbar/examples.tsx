'use client'

import { Navbar } from '@refraction-ui/react-navbar'
import { Button } from '@refraction-ui/react-button'

interface NavbarExamplesProps {
  section: 'basic'
}

export function NavbarExamples({ section }: NavbarExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-6">
          <div className="rounded-lg border overflow-hidden">
            <Navbar
              links={[
                { label: 'Home', href: '/' },
                { label: 'Docs', href: '/docs' },
                { label: 'Components', href: '/components' },
                { label: 'Blog', href: '/blog' },
              ]}
              currentPath="/components"
              logo={<span className="font-bold text-sm">MyApp</span>}
              actions={<Button size="sm">Sign In</Button>}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
