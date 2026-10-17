'use client'

import * as React from 'react'
import { MarkupText, type MarkupTextMention } from '@refraction-ui/react-markup-text'

interface MarkupTextExamplesProps {
  section: 'instructions' | 'message' | 'safety' | 'alignment'
}

// A plain <kbd> keeps this example self-contained; any React node works.
function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </kbd>
  )
}

const MESSAGE = 'Thanks @Ann Lee! The fix is in `useShortcut`, see https://example.com/pr/42 (cc @ops).'

/**
 * In an app these ranges come from the composer's structured tokens (UTF-16
 * offsets), never from parsing "@" in display text. The demo derives them
 * from the sample string so the offsets cannot drift from it.
 */
function rangeOf(id: string, label: string, type: string): MarkupTextMention {
  const start = MESSAGE.indexOf(label)
  return { id, start, end: start + label.length, type }
}

const MESSAGE_MENTIONS: MarkupTextMention[] = [
  rangeOf('user-ann', '@Ann Lee', 'user'),
  rangeOf('channel-ops', '@ops', 'channel'),
]

export function MarkupTextExamples({ section }: MarkupTextExamplesProps) {
  if (section === 'instructions') {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-8 text-sm text-foreground">
        <MarkupText
          as="p"
          text="**Open Settings**, then press {save} to keep your changes."
          inline={{ save: <Key>⌘S</Key> }}
        />
        <MarkupText
          as="p"
          text="Hold {shift} and drag to **select a range**."
          inline={{ shift: <Key>Shift</Key> }}
          strongClassName="text-primary"
        />
      </div>
    )
  }

  if (section === 'message') {
    return <MessageExample />
  }

  if (section === 'safety') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-sm text-foreground">
        <MarkupText
          as="p"
          mode="message"
          text="Only https://example.com becomes a link; javascript:alert(1) and data:text/html,hi stay text."
        />
      </div>
    )
  }

  if (section === 'alignment') {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-card p-8 text-sm text-foreground">
        <MarkupText text="Aligned to the **start**." textAlign="start" />
        <MarkupText text="Aligned to the **center**." textAlign="center" />
        <MarkupText text="Aligned to the **end**." textAlign="end" />
      </div>
    )
  }

  return null
}

function MessageExample() {
  const [last, setLast] = React.useState<string | null>(null)
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-8 text-sm text-foreground">
      <MarkupText
        as="p"
        mode="message"
        text={MESSAGE}
        mentions={MESSAGE_MENTIONS}
        onMentionClick={(mention) => setLast(mention.id)}
      />
      <p className="text-muted-foreground" aria-live="polite">
        {last ? `Opened profile: ${last}` : 'Activate a mention chip to open its profile.'}
      </p>
    </div>
  )
}
