'use client'

import { BottomNav } from '@refraction-ui/react-bottom-nav'

interface BottomNavExamplesProps {
  section: 'basic'
}

export function BottomNavExamples({ section }: BottomNavExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-sm mx-auto rounded-lg border overflow-hidden relative">
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
            Page Content
          </div>
          <BottomNav
            tabs={[
              { label: 'Home', href: '/' },
              { label: 'Search', href: '/search' },
              { label: 'Profile', href: '/profile' },
              { label: 'Settings', href: '/settings' },
            ]}
            currentPath="/"
            className="relative"
          />
        </div>
      </div>
    )
  }

  return null
}
