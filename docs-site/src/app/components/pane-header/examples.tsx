'use client'

import * as React from 'react'
import { PaneHeader, paneHeaderHeightStyle } from '@refraction-ui/react-pane-header'
import { Avatar, AvatarFallback } from '@refraction-ui/react-avatar'
import { Button } from '@refraction-ui/react-button'

interface PaneHeaderExamplesProps {
  section: 'basic' | 'tappable' | 'split-view' | 'truncation'
}

/** Icon buttons in the bar get a 44px (size-11) target, above the icon size. */
const iconButtonClass = 'size-11'

/** The docs page already has an h1 and h2 sections, so demo titles sit at h3. */
const DEMO_HEADING_LEVEL = 3

/** One height for every pane in the split-view demo (a little taller than the default). */
const SPLIT_VIEW_HEADER_HEIGHT = '3.75rem'

function Icon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

const ICON = {
  back: 'M15 18l-6-6 6-6',
  call: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3',
  more: 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  close: 'M18 6 6 18M6 6l12 12',
}

function IconAction({ label, icon }: { label: string; icon: keyof typeof ICON }) {
  return (
    <Button variant="ghost" size="icon" className={iconButtonClass} aria-label={label}>
      <Icon d={ICON[icon]} />
    </Button>
  )
}

function ContactAvatar({ initials }: { initials: string }) {
  // The title already names the person, so the avatar stays unnamed (decorative).
  return (
    <Avatar size="sm">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

export function PaneHeaderExamples({ section }: PaneHeaderExamplesProps) {
  if (section === 'basic') {
    return (
      <section aria-label="Basic pane" className="overflow-hidden rounded-xl border border-border bg-card">
        <PaneHeader
          headingLevel={DEMO_HEADING_LEVEL}
          leading={<IconAction label="Back" icon="back" />}
          avatar={<ContactAvatar initials="AR" />}
          title="Ana Ruiz"
          subtitle="Online"
          actions={
            <>
              <IconAction label="Start call" icon="call" />
              <IconAction label="More options" icon="more" />
            </>
          }
        />
        <div className="p-6 text-sm text-muted-foreground">Conversation…</div>
      </section>
    )
  }

  if (section === 'tappable') {
    return <TappableExample />
  }

  if (section === 'split-view') {
    return (
      // One shared height on the container: every PaneHeader inside reads it,
      // so the rules under the three panes run straight across.
      <div
        style={paneHeaderHeightStyle(SPLIT_VIEW_HEADER_HEIGHT)}
        className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-[1fr_2fr_1fr]"
      >
        <section aria-labelledby="split-inbox-title" className="min-w-0 border-border sm:border-e">
          <PaneHeader
            id="split-inbox"
            headingLevel={DEMO_HEADING_LEVEL}
            title="Inbox"
            actions={<IconAction label="Search messages" icon="search" />}
          />
          <div className="p-4 text-sm text-muted-foreground">12 conversations</div>
        </section>
        <section aria-labelledby="split-chat-title" className="min-w-0 border-border sm:border-e">
          <PaneHeader
            id="split-chat"
            headingLevel={DEMO_HEADING_LEVEL}
            avatar={<ContactAvatar initials="DT" />}
            title="Design team"
            subtitle="8 members"
            onTitleTap={() => {}}
            titleTapHint="Show channel details"
            actions={<IconAction label="Start call" icon="call" />}
          />
          <div className="p-4 text-sm text-muted-foreground">Messages…</div>
        </section>
        <section aria-labelledby="split-thread-title" className="min-w-0">
          <PaneHeader
            id="split-thread"
            headingLevel={DEMO_HEADING_LEVEL}
            title="Thread"
            subtitle="Design team"
            actions={<IconAction label="Close thread" icon="close" />}
          />
          <div className="p-4 text-sm text-muted-foreground">Replies…</div>
        </section>
      </div>
    )
  }

  if (section === 'truncation') {
    return (
      <section aria-label="Narrow pane" className="max-w-xs overflow-hidden rounded-xl border border-border bg-card">
        <PaneHeader
          headingLevel={DEMO_HEADING_LEVEL}
          leading={<IconAction label="Back" icon="back" />}
          avatar={<ContactAvatar initials="QP" />}
          title="Quarterly planning — product, design and engineering leads"
          subtitle="Ana, Ben, Chidi, Dana, Eli and 14 others"
          actions={
            <>
              <IconAction label="Start call" icon="call" />
              <IconAction label="More options" icon="more" />
            </>
          }
        />
        <div className="p-6 text-sm text-muted-foreground">The title gives way; the actions stay.</div>
      </section>
    )
  }

  return null
}

function TappableExample() {
  const [opens, setOpens] = React.useState(0)
  return (
    <section aria-label="Tappable pane" className="overflow-hidden rounded-xl border border-border bg-card">
      <PaneHeader
        headingLevel={DEMO_HEADING_LEVEL}
        avatar={<ContactAvatar initials="AR" />}
        title="Ana Ruiz"
        subtitle="Last seen 5 minutes ago"
        onTitleTap={() => setOpens((n) => n + 1)}
        titleTapHint="Show contact details"
        actions={<IconAction label="Start call" icon="call" />}
      />
      <p className="p-6 text-sm text-muted-foreground" aria-live="polite">
        {opens === 0 ? 'Tap or press Enter on the name to open details.' : `Details opened ${opens} ${opens === 1 ? 'time' : 'times'}.`}
      </p>
    </section>
  )
}
