'use client'

import * as React from 'react'
import { PageHeader } from '@refraction-ui/react-page-header'
import { Button } from '@refraction-ui/react-button'

interface PageHeaderExamplesProps {
  section: 'basic' | 'with-actions' | 'heading-level'
}

export function PageHeaderExamples({ section }: PageHeaderExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <PageHeader
          kicker="Workspace"
          title="Projects"
          description="Everything your team is working on, newest first."
        />
      </div>
    )
  }

  if (section === 'with-actions') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <PageHeader
          kicker="Settings"
          title="Members"
          description="Invite people and choose what they can change."
          actions={
            <>
              <Button variant="outline" size="sm">Export</Button>
              <Button size="sm">Invite member</Button>
            </>
          }
        />
      </div>
    )
  }

  if (section === 'heading-level') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <PageHeader as="h2" title="Notifications" description="Choose which emails you receive." />
      </div>
    )
  }

  return null
}
