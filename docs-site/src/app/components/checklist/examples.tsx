'use client'

import * as React from 'react'
import { Checklist } from '@refraction-ui/react-checklist'
import type { ChecklistItemData } from '@refraction-ui/react-checklist'

interface ChecklistExamplesProps {
  section: 'basic' | 'progress' | 'descriptions'
}

const BASIC_ITEMS: ChecklistItemData[] = [
  { id: '1', label: 'Schedule kick-off meeting', checked: true },
  { id: '2', label: 'Prepare agenda', checked: false },
  { id: '3', label: 'Invite stakeholders', checked: false },
]

const PROGRESS_ITEMS: ChecklistItemData[] = [
  { id: '1', label: 'Review pull request', checked: true },
  { id: '2', label: 'Run test suite', checked: true },
  { id: '3', label: 'Merge to main', checked: false },
  { id: '4', label: 'Deploy to staging', checked: false },
]

const DESCRIPTION_ITEMS: ChecklistItemData[] = [
  {
    id: '1',
    label: 'Send follow-up email',
    description: 'Summarise action items from the meeting.',
    checked: true,
  },
  {
    id: '2',
    label: 'Update project tracker',
    description: 'Mark completed tasks and set due dates.',
    checked: false,
  },
  {
    id: '3',
    label: 'Share recording',
    description: 'Upload to the shared drive and notify the team.',
    checked: false,
  },
]

export function ChecklistExamples({ section }: ChecklistExamplesProps) {
  if (section === 'basic') {
    return <BasicExample />
  }

  if (section === 'progress') {
    return <ProgressExample />
  }

  if (section === 'descriptions') {
    return <DescriptionsExample />
  }

  return null
}

function BasicExample() {
  const [items, setItems] = React.useState<ChecklistItemData[]>(BASIC_ITEMS)
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <Checklist items={items} onChange={setItems} />
    </div>
  )
}

function ProgressExample() {
  const [items, setItems] = React.useState<ChecklistItemData[]>(PROGRESS_ITEMS)
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <Checklist items={items} onChange={setItems} showProgress />
    </div>
  )
}

function DescriptionsExample() {
  const [items, setItems] = React.useState<ChecklistItemData[]>(DESCRIPTION_ITEMS)
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <Checklist items={items} onChange={setItems} showProgress />
    </div>
  )
}
