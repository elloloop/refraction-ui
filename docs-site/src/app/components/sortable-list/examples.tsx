'use client'

import * as React from 'react'
import { SortableList } from '@refraction-ui/react-sortable-list'

interface SortableListExamplesProps {
  section: 'basic' | 'custom-row' | 'keyboard-note'
}

export function SortableListExamples({ section }: SortableListExamplesProps) {
  if (section === 'basic') {
    return <BasicExample />
  }
  if (section === 'custom-row') {
    return <CustomRowExample />
  }
  if (section === 'keyboard-note') {
    return <KeyboardNoteExample />
  }
  return null
}

interface SimpleItem {
  id: string
  label: string
}

function BasicExample() {
  const [items, setItems] = React.useState<SimpleItem[]>([
    { id: '1', label: 'Phone Screen' },
    { id: '2', label: 'Technical Interview' },
    { id: '3', label: 'Take-home Assignment' },
    { id: '4', label: 'Final Interview' },
  ])

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <p className="mb-4 text-sm text-muted-foreground">
        Drag rows by their grip handle to reorder.
      </p>
      <SortableList
        items={items}
        getKey={(item) => item.id}
        onReorder={setItems}
        renderItem={(item) => (
          <span className="text-sm text-foreground">{item.label}</span>
        )}
      />
    </div>
  )
}

interface FieldItem {
  id: string
  type: string
  label: string
  required: boolean
}

function CustomRowExample() {
  const [fields, setFields] = React.useState<FieldItem[]>([
    { id: 'f1', type: 'text', label: 'Full name', required: true },
    { id: 'f2', type: 'email', label: 'Work email', required: true },
    { id: 'f3', type: 'select', label: 'Department', required: false },
    { id: 'f4', type: 'textarea', label: 'Notes', required: false },
  ])

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <p className="mb-4 text-sm text-muted-foreground">
        Custom row content — each row shows the field type badge and required flag.
      </p>
      <SortableList
        items={fields}
        getKey={(item) => item.id}
        onReorder={setFields}
        renderItem={(item) => (
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
              {item.type}
            </span>
            <span className="text-sm text-foreground truncate">{item.label}</span>
            {item.required && (
              <span className="ml-auto text-xs text-muted-foreground shrink-0">required</span>
            )}
          </div>
        )}
      />
    </div>
  )
}

function KeyboardNoteExample() {
  const [items, setItems] = React.useState<SimpleItem[]>([
    { id: 'r1', label: 'Round 1 — Recruiter' },
    { id: 'r2', label: 'Round 2 — Engineering' },
    { id: 'r3', label: 'Round 3 — System Design' },
  ])

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <SortableList
        items={items}
        getKey={(item) => item.id}
        onReorder={setItems}
        renderItem={(item) => (
          <span className="text-sm text-foreground">{item.label}</span>
        )}
      />
      <p className="text-xs text-muted-foreground">
        Focus a grip handle and use{' '}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-xs">↑</kbd>{' '}
        /{' '}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-xs">↓</kbd>{' '}
        to reorder,{' '}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-xs">Home</kbd>{' '}
        /{' '}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-xs">End</kbd>{' '}
        to jump to the first or last position.
      </p>
    </div>
  )
}
