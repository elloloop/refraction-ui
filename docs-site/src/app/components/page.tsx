import Link from 'next/link'

const components = [
  {
    name: 'Button',
    href: '/components/button',
    description: 'Clickable button with 6 variants, 5 sizes, loading and disabled states.',
    category: 'Actions',
  },
  {
    name: 'Input',
    href: '/components/input',
    description: 'Text input with size variants, validation states, and multiple input types.',
    category: 'Forms',
  },
  {
    name: 'Dialog',
    href: '/components/dialog',
    description: 'Modal dialog with compound components: trigger, overlay, content, header, footer.',
    category: 'Overlays',
  },
  {
    name: 'Badge',
    href: '/components/badge',
    description: 'Status badge with 7 variants including semantic success, warning, and destructive.',
    category: 'Data Display',
  },
  {
    name: 'Toast',
    href: '/components/toast',
    description: 'Notification toasts with auto-dismiss, hover pause, and 4 variants.',
    category: 'Feedback',
  },
  {
    name: 'Tabs',
    href: '/components/tabs',
    description: 'Tabbed interface with compound components, keyboard navigation, and ARIA support.',
    category: 'Navigation',
  },
]

const categories = ['Actions', 'Forms', 'Overlays', 'Data Display', 'Feedback', 'Navigation']

export default function ComponentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Components</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse the component catalog. Each component has live examples, a props table, and code snippets.
        </p>
      </div>

      {categories.map((category) => {
        const categoryComponents = components.filter((c) => c.category === category)
        if (categoryComponents.length === 0) return null

        return (
          <div key={category} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {categoryComponents.map((component) => (
                <Link
                  key={component.href}
                  href={component.href}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {component.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {component.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
