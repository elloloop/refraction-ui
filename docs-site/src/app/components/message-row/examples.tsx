'use client'

import * as React from 'react'
import { MessageRow, type MessageRowAction } from '@refraction-ui/react-message-row'
import { Avatar, AvatarFallback } from '@refraction-ui/react-avatar'
import { Badge } from '@refraction-ui/react-badge'
import { IconButton } from '@refraction-ui/react-icon-button'
import { ReactionBar } from '@refraction-ui/react-reaction-bar'

export type MessageRowExampleSection =
  | 'basic'
  | 'actions'
  | 'slots'
  | 'tombstone'
  | 'highlighted'
  | 'gestures'

interface MessageRowExamplesProps {
  section: MessageRowExampleSection
}

/** Matches Avatar `size="sm"` (h-8 / 32 px) so the gutter and the avatar agree. */
const AVATAR_SIZE_PX = 32

/* Inline glyphs (24×24, stroke = currentColor) so the demo has no icon-library dependency. */
function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}
const ReplyIcon = () => (
  <Glyph>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 6 6v5" />
  </Glyph>
)
const ThreadIcon = () => (
  <Glyph>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Glyph>
)
const EditIcon = () => (
  <Glyph>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" />
  </Glyph>
)
const LinkIcon = () => (
  <Glyph>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </Glyph>
)
const TrashIcon = () => (
  <Glyph>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </Glyph>
)

function Person({ initials }: { initials: string }) {
  return (
    <Avatar size="sm">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  // Top padding leaves room for the toolbar, which floats above the first row.
  return <div className="rounded-xl border border-border bg-card px-2 pb-4 pt-8">{children}</div>
}

function useActionLog() {
  const [last, setLast] = React.useState('Nothing yet')
  return { last, log: setLast }
}

function buildActions(log: (text: string) => void): MessageRowAction[] {
  return [
    { icon: <ReplyIcon />, label: 'Reply', onSelected: () => log('Reply') },
    { icon: <ThreadIcon />, label: 'Reply in thread', onSelected: () => log('Reply in thread') },
    { icon: <EditIcon />, label: 'Edit message', onSelected: () => log('Edit message') },
    { icon: <LinkIcon />, label: 'Copy link', onSelected: () => log('Copy link') },
    { icon: <TrashIcon />, label: 'Delete message', onSelected: () => log('Delete message'), destructive: true },
  ]
}

function QuickReactions({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <>
      {['👍', '🎉', '👀'].map((emoji) => (
        <IconButton key={emoji} icon={<span>{emoji}</span>} label={`React with ${emoji}`} size="sm" onClick={() => onReact(emoji)} />
      ))}
    </>
  )
}

export function MessageRowExamples({ section }: MessageRowExamplesProps) {
  switch (section) {
    case 'basic':
      return <BasicExample />
    case 'actions':
      return <ActionsExample />
    case 'slots':
      return <SlotsExample />
    case 'tombstone':
      return <TombstoneExample />
    case 'highlighted':
      return <HighlightedExample />
    case 'gestures':
      return <GesturesExample />
    default:
      return null
  }
}

function BasicExample() {
  return (
    <Frame>
      <MessageRow authorName="Ana Lima" avatar={<Person initials="AL" />} avatarSize={AVATAR_SIZE_PX} timestamp="10:41" body="Morning! The release branch is cut." />
      <MessageRow authorName="Ana Lima" avatarSize={AVATAR_SIZE_PX} timestamp="10:42" continuation body="Changelog is in the PR description — shout if anything is missing." editedLabel="(edited)" />
      <MessageRow
        authorName="Ben Ortiz"
        avatar={<Person initials="BO" />}
        avatarSize={AVATAR_SIZE_PX}
        timestamp="10:45"
        body="Looks good. I'll run the smoke tests after lunch."
        status={<span>Read</span>}
      />
    </Frame>
  )
}

function ActionsExample() {
  const { last, log } = useActionLog()
  const actions = React.useMemo(() => buildActions(log), [log])
  return (
    <div className="space-y-3">
      <Frame>
        <MessageRow
          authorName="Ana Lima"
          avatar={<Person initials="AL" />}
          avatarSize={AVATAR_SIZE_PX}
          timestamp="11:02"
          body="Hover this row, or Tab into it: the toolbar appears. Select some of this text and it gets out of the way."
          actions={actions}
          toolbarLeading={<QuickReactions onReact={(emoji) => log(`Reacted ${emoji}`)} />}
        />
        <MessageRow
          authorName="Ana Lima"
          avatarSize={AVATAR_SIZE_PX}
          timestamp="11:03"
          continuation
          body="Only one action inline here; the rest are under More actions."
          actions={actions}
          maxInlineActions={1}
        />
      </Frame>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Last action: {last}
      </p>
    </div>
  )
}

function SlotsExample() {
  const [reactions, setReactions] = React.useState([
    { emoji: '👍', count: 3, userReacted: true },
    { emoji: '🚀', count: 1, userReacted: false },
  ])
  const toggle = (emoji: string) =>
    setReactions((list) =>
      list.map((r) => (r.emoji === emoji ? { ...r, count: r.count + (r.userReacted ? -1 : 1), userReacted: !r.userReacted } : r)),
    )
  return (
    <Frame>
      <MessageRow
        authorName="Ben Ortiz"
        avatar={<Person initials="BO" />}
        avatarSize={AVATAR_SIZE_PX}
        timestamp="12:10"
        quote={
          <span>
            <span className="font-medium text-foreground">Ana Lima</span> The release branch is cut.
          </span>
        }
        body="Smoke tests passed on staging."
        footer={<ReactionBar reactions={reactions} onToggle={toggle} showAddButton={false} />}
      />
      <MessageRow
        authorName="Deploy Bot"
        avatar={<Person initials="DB" />}
        avatarSize={AVATAR_SIZE_PX}
        timestamp="12:14"
        labels={
          <>
            <Badge variant="secondary" size="md">
              Bot
            </Badge>
            <span>Forwarded · #releases</span>
          </>
        }
        body="v2.4.0 deployed to production."
        status={<span>Delivered</span>}
      />
    </Frame>
  )
}

function TombstoneExample() {
  return (
    <Frame>
      <MessageRow authorName="Ana Lima" avatar={<Person initials="AL" />} avatarSize={AVATAR_SIZE_PX} timestamp="09:12" tombstone actions={buildActions(() => {})} />
      <MessageRow authorName="Ben Ortiz" avatar={<Person initials="BO" />} avatarSize={AVATAR_SIZE_PX} timestamp="09:15" tombstone tombstoneText="This message was removed by an admin" />
    </Frame>
  )
}

function HighlightedExample() {
  const [jumps, setJumps] = React.useState(0)
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => setJumps((n) => n + 1)}
      >
        Jump to message
      </button>
      <Frame>
        <MessageRow authorName="Ana Lima" avatar={<Person initials="AL" />} avatarSize={AVATAR_SIZE_PX} timestamp="14:00" body="Earlier context." />
        {/* A new key remounts the row so each jump replays the highlight. */}
        <MessageRow
          key={jumps}
          authorName="Ben Ortiz"
          avatar={<Person initials="BO" />}
          avatarSize={AVATAR_SIZE_PX}
          timestamp="14:02"
          body="This is the message you linked to."
          highlighted={jumps > 0}
        />
      </Frame>
    </div>
  )
}

function GesturesExample() {
  const { last, log } = useActionLog()
  return (
    <div className="space-y-3">
      <Frame>
        <MessageRow
          authorName="Ana Lima"
          avatar={<Person initials="AL" />}
          avatarSize={AVATAR_SIZE_PX}
          timestamp="15:30"
          body="Click, press and hold, or right-click this row. Dragging to select text never counts as a long-press."
          onTap={() => log('Tap')}
          onLongPress={() => log('Long-press')}
          onContextMenu={(event) => {
            event.preventDefault()
            log(`Context menu at ${event.clientX}, ${event.clientY}`)
          }}
          actions={buildActions(log)}
        />
      </Frame>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Last gesture: {last}
      </p>
    </div>
  )
}
