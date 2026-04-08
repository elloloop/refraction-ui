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

const categoryIcons: Record<string, React.ReactNode> = {
  Actions: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
    </svg>
  ),
  Forms: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  Overlays: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-8.25A2.25 2.25 0 0 1 7.5 18v-1.5" />
    </svg>
  ),
  'Data Display': (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  ),
  Feedback: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
  Navigation: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  ),
}

const categories = ['Actions', 'Forms', 'Overlays', 'Data Display', 'Feedback', 'Navigation']

export default function ComponentsPage() {
  return (
    <div className="space-y-10">
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
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{categoryIcons[category]}</span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {categoryComponents.map((component) => (
                <Link
                  key={component.href}
                  href={component.href}
                  className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {component.name}
                    </h3>
                    <svg className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
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
