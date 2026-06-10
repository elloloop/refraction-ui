'use client'

import { useState } from 'react'
import { CommandInput } from '@refraction-ui/react-command-input'

interface CommandInputExamplesProps {
  section: 'mentions' | 'commands'
}

export function CommandInputExamples({ section }: CommandInputExamplesProps) {
  const [value, setValue] = useState('')

  if (section === 'mentions') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-md space-y-3">
          <CommandInput
            value={value}
            onChange={setValue}
            triggers={[{ char: '@' }]}
            renderPopover={({ isOpen, trigger, search }) =>
              isOpen ? (
                <div className="mt-1 rounded-md border border-border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-sm">
                  Mentioning with <code className="bg-muted px-1 rounded">{trigger}</code>
                  {search ? `: "${search}"` : '…'}
                </div>
              ) : null
            }
          />
          <p className="text-xs text-muted-foreground">
            Type <code className="bg-muted px-1 rounded">@</code> to trigger the mention popover.
          </p>
        </div>
      </div>
    )
  }

  if (section === 'commands') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-md space-y-3">
          <CommandInput
            value={value}
            onChange={setValue}
            triggers={[{ char: '/' }, { char: '#' }]}
            renderPopover={({ isOpen, trigger, search }) =>
              isOpen ? (
                <div className="mt-1 rounded-md border border-border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-sm">
                  {trigger === '/' ? 'Slash command' : 'Channel'} {search && `→ ${search}`}
                </div>
              ) : null
            }
          />
          <p className="text-xs text-muted-foreground">
            Triggers on <code className="bg-muted px-1 rounded">/</code> and{' '}
            <code className="bg-muted px-1 rounded">#</code>.
          </p>
        </div>
      </div>
    )
  }

  return null
}
