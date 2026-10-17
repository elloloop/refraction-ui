'use client'

import * as React from 'react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@refraction-ui/react-context-menu'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@refraction-ui/react-dropdown-menu'

interface ContextMenuExamplesProps {
  section: 'basic' | 'checkable' | 'shared'
}

const TARGET_CLASS =
  'rounded-lg border border-dashed border-border bg-background p-6 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

function LastAction({ value }: { value: string | null }) {
  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      {value ? `Last action: ${value}` : 'No action yet'}
    </p>
  )
}

export function ContextMenuExamples({ section }: ContextMenuExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'checkable') return <CheckableExample />
  if (section === 'shared') return <SharedDefinitionExample />
  return null
}

function BasicExample() {
  const [last, setLast] = React.useState<string | null>(null)
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-8">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div tabIndex={0} className={TARGET_CLASS}>
            <p className="font-medium">Ada Lovelace</p>
            <p className="text-muted-foreground">Shipping the release at five. Right-click, long-press, or focus and press Shift+F10.</p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Message actions">
          <ContextMenuItem onSelect={() => setLast('Reply')}>
            Reply<ContextMenuShortcut>R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast('Copy text')}>
            Copy text<ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>Edit (only your own messages)</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent aria-label="Destinations">
              <ContextMenuItem onSelect={() => setLast('Moved to Archive')}>Archive</ContextMenuItem>
              <ContextMenuItem onSelect={() => setLast('Moved to Later')}>Later</ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Channel</ContextMenuSubTrigger>
                <ContextMenuSubContent aria-label="Channels">
                  <ContextMenuItem onSelect={() => setLast('Moved to #general')}>#general</ContextMenuItem>
                  <ContextMenuItem onSelect={() => setLast('Moved to #releases')}>#releases</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onSelect={() => setLast('Delete message')}>
            Delete message<ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <LastAction value={last} />
    </div>
  )
}

function CheckableExample() {
  const [showPreviews, setShowPreviews] = React.useState(true)
  const [compact, setCompact] = React.useState(false)
  const [sort, setSort] = React.useState('newest')
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-8">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div tabIndex={0} className={TARGET_CLASS}>
            Right-click the channel list to change its view options.
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="View options">
          <ContextMenuLabel inset>View</ContextMenuLabel>
          <ContextMenuCheckboxItem checked={showPreviews} onCheckedChange={setShowPreviews}>
            Show message previews
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={compact} onCheckedChange={setCompact}>
            Compact rows
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel inset id="ctx-sort-label">
            Sort by
          </ContextMenuLabel>
          <ContextMenuRadioGroup value={sort} onValueChange={setSort} aria-labelledby="ctx-sort-label">
            <ContextMenuRadioItem value="newest">Newest first</ContextMenuRadioItem>
            <ContextMenuRadioItem value="unread">Unread first</ContextMenuRadioItem>
            <ContextMenuRadioItem value="alpha">A to Z</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
      <p className="text-sm text-muted-foreground">
        {`Previews ${showPreviews ? 'on' : 'off'} · Compact ${compact ? 'on' : 'off'} · Sort: ${sort}`}
      </p>
    </div>
  )
}

interface FileAction {
  label: string
  disabled?: boolean
}

/** One menu definition, rendered by both a DropdownMenu and a ContextMenu. */
const FILE_ACTIONS: FileAction[] = [{ label: 'Open' }, { label: 'Rename' }, { label: 'Share', disabled: true }, { label: 'Download' }]

function SharedDefinitionExample() {
  const [last, setLast] = React.useState<string | null>(null)
  const itemProps = (action: FileAction) => ({ disabled: action.disabled, onSelect: () => setLast(action.label) })
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-8">
      <div className="flex flex-wrap items-center gap-4">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div tabIndex={0} className={TARGET_CLASS}>
              roadmap.pdf (right-click)
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent aria-label="File actions">
            {FILE_ACTIONS.map((action) => (
              <ContextMenuItem key={action.label} {...itemProps(action)}>
                {action.label}
              </ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-4 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            File actions
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {FILE_ACTIONS.map((action) => (
              <DropdownMenuItem key={action.label} {...itemProps(action)}>
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <LastAction value={last} />
    </div>
  )
}
