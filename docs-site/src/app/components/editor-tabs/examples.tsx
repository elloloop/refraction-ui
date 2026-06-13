'use client'

import * as React from 'react'
import { EditorTabs } from '@refraction-ui/react-editor-tabs'
import type { EditorTabData } from '@refraction-ui/react-editor-tabs'

interface EditorTabsExamplesProps {
  section: 'basic' | 'dirty-close' | 'keyboard'
}

export function EditorTabsExamples({ section }: EditorTabsExamplesProps) {
  if (section === 'basic') {
    return <BasicExample />
  }

  if (section === 'dirty-close') {
    return <DirtyCloseExample />
  }

  if (section === 'keyboard') {
    return <KeyboardExample />
  }

  return null
}

function BasicExample() {
  const [activeId, setActiveId] = React.useState('solution')

  const tabs: EditorTabData[] = [
    { id: 'solution', label: 'solution.py', icon: '🐍' },
    { id: 'tests', label: 'tests.py', icon: '🧪' },
    { id: 'notes', label: 'notes.md', icon: '📝' },
  ]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <EditorTabs tabs={tabs} activeId={activeId} onSelect={setActiveId} />
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Active tab: {activeId}</p>
      </div>
    </div>
  )
}

function DirtyCloseExample() {
  const [tabs, setTabs] = React.useState<EditorTabData[]>([
    { id: 'solution', label: 'solution.py', icon: '🐍', dirty: true, closable: true },
    { id: 'tests', label: 'tests.py', icon: '🧪', closable: true },
    { id: 'notes', label: 'notes.md', icon: '📝', dirty: true, closable: true },
  ])
  const [activeId, setActiveId] = React.useState('solution')

  const handleClose = (id: string) => {
    const remaining = tabs.filter((t) => t.id !== id)
    setTabs(remaining)
    if (activeId === id && remaining.length > 0) {
      setActiveId(remaining[0].id)
    }
  }

  if (tabs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <p className="text-sm text-muted-foreground text-center">All tabs closed.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <EditorTabs
        tabs={tabs}
        activeId={activeId}
        onSelect={setActiveId}
        onClose={handleClose}
      />
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          The amber dot signals unsaved changes. Click × to close a tab.
        </p>
      </div>
    </div>
  )
}

function KeyboardExample() {
  const [activeId, setActiveId] = React.useState('solution')

  const tabs: EditorTabData[] = [
    { id: 'solution', label: 'solution.py' },
    { id: 'tests', label: 'tests.py' },
    { id: 'notes', label: 'notes.md' },
    { id: 'readme', label: 'README.md' },
  ]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <EditorTabs tabs={tabs} activeId={activeId} onSelect={setActiveId} />
      <div className="p-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          Focus a tab and use <kbd className="text-xs bg-muted border border-border rounded px-1 py-0.5">←</kbd>{' '}
          <kbd className="text-xs bg-muted border border-border rounded px-1 py-0.5">→</kbd> to move between tabs — wrapping at the ends.
          <kbd className="ml-2 text-xs bg-muted border border-border rounded px-1 py-0.5">Home</kbd>{' '}
          <kbd className="text-xs bg-muted border border-border rounded px-1 py-0.5">End</kbd> jump to the first/last tab.
        </p>
        <p className="text-sm text-muted-foreground">Active tab: {activeId}</p>
      </div>
    </div>
  )
}
