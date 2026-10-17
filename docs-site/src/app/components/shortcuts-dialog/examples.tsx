'use client'

import * as React from 'react'
import { ShortcutsDialog, type ShortcutsDialogShortcut } from '@refraction-ui/react-shortcuts-dialog'
import { useShortcut } from '@refraction-ui/react-keyboard-shortcut'
import { Button } from '@refraction-ui/react-button'

export type ShortcutsDialogExampleSection = 'basic' | 'defaults' | 'static' | 'localised'

interface ShortcutsDialogExamplesProps {
  section: ShortcutsDialogExampleSection
}

/** Shortcuts the inbox demo registers with useShortcut, so the dialog lists them live. */
const INBOX_SHORTCUTS = [
  { shortcut: 'Alt+J', description: 'Next conversation', group: 'Navigation' },
  { shortcut: 'Alt+K', description: 'Previous conversation', group: 'Navigation' },
  { shortcut: 'Alt+E', description: 'Archive', group: 'Messages' },
  { shortcut: 'Alt+R', description: 'Reply', group: 'Messages' },
] as const

/** Shortcuts handled outside useShortcut (e.g. by an editor), passed in directly. */
const EDITOR_SHORTCUTS: ShortcutsDialogShortcut[] = [
  { keys: ['Mod', 'B'], description: 'Bold', group: 'Formatting' },
  { keys: ['Mod', 'I'], description: 'Italic', group: 'Formatting' },
  { keys: ['Mod', 'Shift', 'X'], description: 'Strikethrough', group: 'Formatting' },
  { keys: ['Mod', 'Enter'], description: 'Send message', group: 'Composer' },
  { keys: ['Shift', 'Enter'], description: 'New line', group: 'Composer' },
  { keys: ['ArrowUp'], description: 'Edit last message', group: 'Composer' },
]

const GERMAN_LABELS = {
  title: 'Tastenkürzel',
  description: 'Drücken Sie eine Kombination außerhalb eines Textfelds.',
  searchLabel: 'Tastenkürzel durchsuchen',
  searchPlaceholder: 'Nach Aktion oder Taste suchen…',
  empty: 'Keine Tastenkürzel gefunden.',
  close: 'Schließen',
  openShortcut: 'Tastenkürzel anzeigen',
  alternative: 'oder',
  resultCount: (count: number) => (count === 1 ? '1 Tastenkürzel' : `${count} Tastenkürzel`),
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-8 space-y-4">{children}</div>
}

function RegisteredShortcut({
  shortcut,
  description,
  group,
  onRun,
}: (typeof INBOX_SHORTCUTS)[number] & { onRun: (description: string) => void }) {
  const onTrigger = React.useCallback(() => onRun(description), [onRun, description])
  useShortcut({ shortcut, description, group, onTrigger })
  return null
}

/** The live demo: the only example that listens for ⌘/ / Ctrl+/ and ?, so one dialog opens. */
function InboxExample() {
  const [lastAction, setLastAction] = React.useState('None yet')
  return (
    <Panel>
      {INBOX_SHORTCUTS.map((item) => (
        <RegisteredShortcut key={item.shortcut} {...item} onRun={setLastAction} />
      ))}
      <ShortcutsDialog trigger={<Button variant="outline">Keyboard shortcuts</Button>} />
      <p className="text-sm text-muted-foreground">
        Press <kbd className="font-mono">?</kbd> or ⌘/ (Ctrl+/) with focus outside a text field.
      </p>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Last shortcut: <span className="font-medium text-foreground">{lastAction}</span>
      </p>
    </Panel>
  )
}

export function ShortcutsDialogExamples({ section }: ShortcutsDialogExamplesProps) {
  if (section === 'basic') return <InboxExample />

  if (section === 'defaults') {
    return (
      <Panel>
        <ShortcutsDialog
          includeDefaults
          openShortcut={false}
          trigger={<Button variant="outline">Show default shortcuts</Button>}
        />
      </Panel>
    )
  }

  if (section === 'static') {
    return (
      <Panel>
        <ShortcutsDialog
          shortcuts={EDITOR_SHORTCUTS}
          groupOrder={['Composer', 'Formatting']}
          openShortcut={false}
          trigger={<Button variant="outline">Editor shortcuts</Button>}
        />
      </Panel>
    )
  }

  if (section === 'localised') {
    return (
      <Panel>
        <ShortcutsDialog
          shortcuts={EDITOR_SHORTCUTS.slice(0, 2)}
          labels={GERMAN_LABELS}
          openShortcut={false}
          trigger={<Button variant="outline">Tastenkürzel</Button>}
        />
      </Panel>
    )
  }

  return null
}
