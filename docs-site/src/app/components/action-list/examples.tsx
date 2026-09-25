'use client'

import * as React from 'react'
import { ActionList, ActionListItem } from '@refraction-ui/react-action-list'

interface ActionListExamplesProps {
  section: 'basic' | 'compact' | 'disabled'
}

const reports = [
  { id: 'q3', title: 'Quarterly report', description: 'Revenue by region', meta: 'Finance', trailing: 'Updated 2h ago' },
  { id: 'annual', title: 'Annual summary', description: 'Year-over-year growth', meta: 'Leadership', trailing: 'Updated yesterday' },
  { id: 'churn', title: 'Retention analysis', description: 'Cohorts by sign-up month', meta: 'Growth', trailing: 'Updated 3 days ago' },
]

function Selected({ value }: { value: string | null }) {
  return <p className="px-4 py-2 text-sm text-muted-foreground">Opened: {value ?? 'nothing yet'}</p>
}

export function ActionListExamples({ section }: ActionListExamplesProps) {
  const [opened, setOpened] = React.useState<string | null>(null)

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card">
        <ActionList aria-label="Reports">
          {reports.map((r) => (
            <ActionListItem
              key={r.id}
              title={r.title}
              description={r.description}
              meta={r.meta}
              trailing={r.trailing}
              onClick={() => setOpened(r.title)}
            />
          ))}
        </ActionList>
        <Selected value={opened} />
      </div>
    )
  }

  if (section === 'compact') {
    return (
      <div className="rounded-xl border border-border bg-card">
        <ActionList aria-label="Recent files">
          {reports.map((r) => (
            <ActionListItem key={r.id} density="compact" title={r.title} trailing={r.trailing} />
          ))}
        </ActionList>
      </div>
    )
  }

  if (section === 'disabled') {
    return (
      <div className="rounded-xl border border-border bg-card">
        <ActionList aria-label="Exports">
          <ActionListItem title="Export as CSV" description="All rows, all columns" />
          <ActionListItem title="Export as PDF" description="Available on paid plans" disabled />
        </ActionList>
      </div>
    )
  }

  return null
}
