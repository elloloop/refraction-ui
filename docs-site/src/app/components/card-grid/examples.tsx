'use client'

import { CardGrid } from '@refraction-ui/react-card-grid'

interface CardGridExamplesProps {
  section: 'columns-three' | 'columns-two'
}

const cards = [
  { title: 'Analytics', body: 'Track engagement across every surface in real time.' },
  { title: 'Automation', body: 'Wire up workflows without writing glue code.' },
  { title: 'Integrations', body: 'Connect the tools your team already uses.' },
  { title: 'Security', body: 'SSO, audit logs, and fine-grained permissions.' },
  { title: 'Billing', body: 'Usage-based pricing with transparent invoices.' },
  { title: 'Support', body: 'Talk to a human whenever you get stuck.' },
]

function Cards() {
  return (
    <>
      {cards.map((c) => (
        <div key={c.title} className="rounded-lg border border-border bg-background p-5">
          <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
        </div>
      ))}
    </>
  )
}

export function CardGridExamples({ section }: CardGridExamplesProps) {
  if (section === 'columns-two') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <CardGrid columns={2} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Cards />
        </CardGrid>
      </div>
    )
  }

  // columns-three (default)
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <CardGrid columns={3} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Cards />
      </CardGrid>
    </div>
  )
}
