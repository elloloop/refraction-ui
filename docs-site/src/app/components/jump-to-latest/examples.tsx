'use client'

import * as React from 'react'
import { JumpToLatest, useJumpToLatest } from '@refraction-ui/react-jump-to-latest'
import { VirtualList, type VirtualListHandle } from '@refraction-ui/react-virtual-list'
import { Button } from '@refraction-ui/react-button'

interface JumpToLatestExamplesProps {
  section: 'plain' | 'virtual-list' | 'first-unread'
}

interface Message {
  id: number
  author: string
  text: string
}

const PLAIN_INITIAL_COUNT = 30
const VIRTUAL_INITIAL_COUNT = 2_000
const BURST_SIZE = 3
const AUTHORS = ['Ada', 'Grace', 'Linus', 'Margaret']
const WORDS =
  'the deploy finished and the dashboards look healthy so we can close the incident channel now'.split(' ')
/** Word-count spread so rows have visibly different heights. */
const WORD_STEP = 5
const WORD_SPREAD = 29
/** Centres the pill over the bottom of its list. */
const PILL_POSITION = 'absolute bottom-4 left-1/2 -translate-x-1/2'
const SCROLLER_CLASS = [
  'relative h-80 overflow-y-auto rounded-md border border-border bg-background',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
].join(' ')

/** Deterministic, variable-length message text for message `id`. */
function messageText(id: number): string {
  const length = 3 + ((id * WORD_STEP) % WORD_SPREAD)
  return Array.from({ length }, (_, i) => WORDS[(id + i) % WORDS.length]).join(' ')
}

function makeMessage(id: number): Message {
  return { id, author: AUTHORS[id % AUTHORS.length], text: messageText(id) }
}

function makeMessages(count: number): Message[] {
  return Array.from({ length: count }, (_, i) => makeMessage(i))
}

function appendMessages(current: Message[], count: number): Message[] {
  const next = current.at(-1)?.id ?? -1
  return [...current, ...Array.from({ length: count }, (_, i) => makeMessage(next + 1 + i))]
}

function MessageRow({ message }: { message: Message }) {
  return (
    <div className="border-b border-border px-4 py-3" data-message-id={message.id}>
      <p className="text-sm font-medium text-foreground">{`${message.author} · #${message.id}`}</p>
      <p className="text-sm text-muted-foreground">{message.text}</p>
    </div>
  )
}

/** Buttons that simulate messages arriving from other people. */
function ArrivalControls({ onReceive }: { onReceive: (count: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={() => onReceive(1)}>
        Receive a message
      </Button>
      <Button size="sm" variant="outline" onClick={() => onReceive(BURST_SIZE)}>
        {`Receive ${BURST_SIZE}`}
      </Button>
      <span className="text-sm text-muted-foreground">Scroll up first, then receive.</span>
    </div>
  )
}

export function JumpToLatestExamples({ section }: JumpToLatestExamplesProps) {
  if (section === 'plain') return <PlainScrollerExample />
  if (section === 'virtual-list') return <VirtualListExample />
  if (section === 'first-unread') return <FirstUnreadExample />
  return null
}

/** Opens a plain scroller at its end once, like a chat. */
function useOpenAtEnd(scrollRef: React.RefObject<HTMLDivElement | null>) {
  React.useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [scrollRef])
}

function PlainScrollerExample() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [messages, setMessages] = React.useState(() => makeMessages(PLAIN_INITIAL_COUNT))
  const jtl = useJumpToLatest({
    scrollRef,
    keys: messages.map((m) => m.id),
    stickToEnd: true,
  })
  useOpenAtEnd(scrollRef)

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="relative">
        {/* A live log only while the reader is at the end; away from it the pill announces. */}
        <div
          ref={scrollRef}
          role="log"
          aria-live={jtl.atEnd ? 'polite' : 'off'}
          aria-label="Team chat"
          tabIndex={0}
          className={SCROLLER_CLASS}
        >
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
        </div>
        <JumpToLatest controller={jtl} className={PILL_POSITION} />
      </div>
      <ArrivalControls onReceive={(count) => setMessages((current) => appendMessages(current, count))} />
    </div>
  )
}

function VirtualListExample() {
  const listRef = React.useRef<VirtualListHandle>(null)
  const [messages, setMessages] = React.useState(() => makeMessages(VIRTUAL_INITIAL_COUNT))
  const jtl = useJumpToLatest({ listRef, keys: messages.map((m) => m.id) })

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="relative">
        <VirtualList
          ref={listRef}
          items={messages}
          getItemKey={(m) => m.id}
          renderItem={(m) => <MessageRow message={m} />}
          estimatedItemSize={72}
          anchor="end"
          role="log"
          className="h-80 rounded-md border border-border bg-background"
          aria-label="Team chat, 2,000 messages"
        />
        <JumpToLatest controller={jtl} className={PILL_POSITION} />
      </div>
      <ArrivalControls onReceive={(count) => setMessages((current) => appendMessages(current, count))} />
    </div>
  )
}

function formatUnreadReplies(count: number): string {
  return count === 1 ? '1 unread reply' : `${count} unread replies`
}

function FirstUnreadExample() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [messages, setMessages] = React.useState(() => makeMessages(PLAIN_INITIAL_COUNT))
  const jtl = useJumpToLatest({
    scrollRef,
    keys: messages.map((m) => m.id),
    stickToEnd: true,
    // The scroller is `relative`, so an item's offsetTop is its position inside it.
    scrollToItem: ({ key }, behavior) => {
      const scroller = scrollRef.current
      const item = scroller?.querySelector<HTMLElement>(`[data-message-id="${key}"]`)
      if (scroller && item) scroller.scrollTo({ top: item.offsetTop, behavior })
    },
  })
  useOpenAtEnd(scrollRef)

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="relative">
        <div
          ref={scrollRef}
          role="log"
          aria-live={jtl.atEnd ? 'polite' : 'off'}
          aria-label="Thread replies"
          tabIndex={0}
          className={SCROLLER_CLASS}
        >
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
        </div>
        <JumpToLatest
          controller={jtl}
          jumpTo="first-unread"
          formatNewCount={formatUnreadReplies}
          latestLabel="Back to newest"
          className={PILL_POSITION}
        />
      </div>
      <ArrivalControls onReceive={(count) => setMessages((current) => appendMessages(current, count))} />
      <p className="text-xs text-muted-foreground">
        {jtl.firstUnreadKey === null
          ? 'Nothing unread.'
          : `First unread: #${jtl.firstUnreadKey} (${jtl.newCount} since you scrolled up)`}
      </p>
    </div>
  )
}
