'use client'

import { Breadcrumbs } from '@refraction-ui/react-breadcrumbs'

interface BreadcrumbsExamplesProps {
  section: 'basic'
}

export function BreadcrumbsExamples({ section }: BreadcrumbsExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Auto-generated from path</span>
            <Breadcrumbs pathname="/docs/components/button" />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">With custom labels</span>
            <Breadcrumbs
              pathname="/docs/components/button"
              labels={{ docs: 'Documentation', components: 'UI Components' }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Manual items</span>
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: 'Widgets', href: '/products/widgets' },
                { label: 'Blue Widget' },
              ]}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
