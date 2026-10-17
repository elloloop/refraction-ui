'use client'

import * as React from 'react'
import {
  VirtualList,
  type VirtualListAlign,
  type VirtualListHandle,
} from '@refraction-ui/react-virtual-list'
import { Button } from '@refraction-ui/react-button'

interface VirtualListExamplesProps {
  section: 'basic' | 'chat' | 'scroll-to'
}

interface Message {
  id: number
  author: string
  text: string
}

const BASIC_ROW_COUNT = 10_000
const CHAT_HISTORY_SIZE = 2_000
const CHAT_INITIAL_LOADED = 100
const CHAT_PAGE_SIZE = 50
const AUTHORS = ['Ada', 'Grace', 'Linus', 'Margaret']
const WORDS =
  'the build is green again after the cache fix so we can ship the release candidate this afternoon'.split(' ')
/** Word-count spread so rows have visibly different heights. */
const WORD_STEP = 7
const WORD_SPREAD = 41

/** Deterministic, variable-length message text for row `id`. */
function messageText(id: number): string {
  const length = 3 + ((id * WORD_STEP) % WORD_SPREAD)
  return Array.from({ length }, (_, i) => WORDS[(id + i) % WORDS.length]).join(' ')
}

function makeMessage(id: number): Message {
  return { id, author: AUTHORS[id % AUTHORS.length], text: messageText(id) }
}

function range(from: number, to: number): Message[] {
  return Array.from({ length: Math.max(0, to - from) }, (_, i) => makeMessage(from + i))
}

function MessageRow({ message }: { message: Message }) {
  return (
    <div className="border-b border-border px-4 py-3">
      <p className="text-sm font-medium text-foreground">
        {`${message.author} · #${message.id}`}
      </p>
      <p className="text-sm text-muted-foreground">{message.text}</p>
    </div>
  )
}

const BASIC_ITEMS = range(0, BASIC_ROW_COUNT)

export function VirtualListExamples({ section }: VirtualListExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card">
        <VirtualList
          items={BASIC_ITEMS}
          getItemKey={(m) => m.id}
          renderItem={(m) => <MessageRow message={m} />}
          estimatedItemSize={72}
          className="h-80 rounded-xl"
          aria-label="10,000 messages"
        />
      </div>
    )
  }

  if (section === 'chat') return <ChatExample />
  if (section === 'scroll-to') return <ScrollToExample />
  return null
}

function ChatExample() {
  const listRef = React.useRef<VirtualListHandle>(null)
  // The newest CHAT_INITIAL_LOADED messages of a CHAT_HISTORY_SIZE history.
  const [messages, setMessages] = React.useState(() =>
    range(CHAT_HISTORY_SIZE - CHAT_INITIAL_LOADED, CHAT_HISTORY_SIZE),
  )
  const [atEnd, setAtEnd] = React.useState(true)
  const [unread, setUnread] = React.useState(0)
  const oldest = messages[0]?.id ?? 0

  const loadOlder = React.useCallback(() => {
    setMessages((current) => {
      const first = current[0]?.id ?? 0
      if (first === 0) return current
      return [...range(Math.max(0, first - CHAT_PAGE_SIZE), first), ...current]
    })
  }, [])

  const send = () => {
    setMessages((current) => [...current, makeMessage((current.at(-1)?.id ?? 0) + 1)])
    if (!atEnd) setUnread((n) => n + 1)
  }

  const handleAtEndChange = (next: boolean) => {
    setAtEnd(next)
    if (next) setUnread(0)
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <VirtualList
        ref={listRef}
        items={messages}
        getItemKey={(m) => m.id}
        renderItem={(m) => <MessageRow message={m} />}
        estimatedItemSize={72}
        anchor="end"
        role="log"
        onAtEndChange={handleAtEndChange}
        onRangeChange={({ start }) => {
          if (start === 0) loadOlder()
        }}
        className="h-80 rounded-md border border-border bg-background"
        aria-label="Team chat"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={send}>
          Send a message
        </Button>
        <Button size="sm" variant="outline" onClick={loadOlder} disabled={oldest === 0}>
          Load older
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => listRef.current?.scrollToEnd({ behavior: 'smooth' })}
          disabled={atEnd}
        >
          {unread > 0 ? `Jump to latest (${unread} new)` : 'Jump to latest'}
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {atEnd ? 'Following new messages' : 'Paused — scrolled up'}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {`${messages.length} of ${CHAT_HISTORY_SIZE} messages loaded`}
      </p>
    </div>
  )
}

const ALIGNS: VirtualListAlign[] = ['start', 'center', 'end', 'auto']

function ScrollToExample() {
  const listRef = React.useRef<VirtualListHandle>(null)
  const [index, setIndex] = React.useState(5000)
  const inputId = React.useId()

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            Row index
          </label>
          <input
            id={inputId}
            type="number"
            min={0}
            max={BASIC_ROW_COUNT - 1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>
        {ALIGNS.map((align) => (
          <Button
            key={align}
            size="sm"
            variant="outline"
            onClick={() => listRef.current?.scrollToIndex(index, { align, behavior: 'smooth' })}
          >
            {`Align ${align}`}
          </Button>
        ))}
      </div>
      <VirtualList
        ref={listRef}
        items={BASIC_ITEMS}
        getItemKey={(m) => m.id}
        renderItem={(m) => <MessageRow message={m} />}
        estimatedItemSize={72}
        className="h-80 rounded-md border border-border bg-background"
        aria-label="Scrollable messages"
      />
    </div>
  )
}
