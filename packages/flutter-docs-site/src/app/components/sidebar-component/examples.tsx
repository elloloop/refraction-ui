'use client'

import { Sidebar } from '@refraction-ui/react-sidebar'

interface SidebarExamplesProps {
  section: 'basic'
}

export function SidebarExamples({ section }: SidebarExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="h-[300px] relative rounded-lg border overflow-hidden">
          <Sidebar
            sections={[
              {
                title: 'Getting Started',
                items: [
                  { label: 'Introduction', href: '/intro' },
                  { label: 'Installation', href: '/install' },
                ],
              },
              {
                title: 'Components',
                items: [
                  { label: 'Button', href: '/components/button' },
                  { label: 'Input', href: '/components/input' },
                  { label: 'Dialog', href: '/components/dialog' },
                ],
              },
            ]}
            currentPath="/components/button"
            className="relative h-full"
          />
        </div>
      </div>
    )
  }

  return null
}
