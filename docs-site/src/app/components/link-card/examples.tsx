'use client'

import { LinkCard } from '@refraction-ui/react-link-card'

interface LinkCardExamplesProps {
  section: 'basic' | 'list'
}

export function LinkCardExamples({ section }: LinkCardExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <LinkCard
          href="https://refraction-ui.dev/docs"
          className="block max-w-sm rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          <span className="block text-sm font-semibold text-foreground">Documentation</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Guides, API references, and examples for getting started.
          </span>
        </LinkCard>
      </div>
    )
  }

  if (section === 'list') {
    const cards = [
      { href: '/components/button', title: 'Button', body: 'Clickable button with variants and states.' },
      { href: '/components/pagination', title: 'Pagination', body: 'Navigate across pages of content.' },
      { href: '/components/mobile-nav', title: 'Mobile Nav', body: 'Collapsible navigation for small screens.' },
    ]
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <LinkCard
              key={c.href}
              href={c.href}
              className="block rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <span className="block text-sm font-semibold text-foreground">{c.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{c.body}</span>
            </LinkCard>
          ))}
        </div>
      </div>
    )
  }

  return null
}
