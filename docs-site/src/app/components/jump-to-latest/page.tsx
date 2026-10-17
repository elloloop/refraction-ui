import { JumpToLatestExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const jumpToLatestProps = [
  {
    name: 'controller',
    type: 'JumpToLatestController',
    description:
      'The tracker returned by `useJumpToLatest` (or any object of the same shape): `atEnd`, `newCount`, `firstUnreadKey`, `firstUnreadIndex`, `jump()`, `jumpToFirstUnread()` and `getScrollElement()`.',
  },
  {
    name: 'jumpTo',
    type: "'latest' | 'first-unread'",
    default: "'latest'",
    description:
      "'latest' scrolls to the end. 'first-unread' scrolls to the first item that arrived while away and marks them read, so the next press goes to the end.",
  },
  {
    name: 'formatNewCount',
    type: '(count: number) => string',
    default: '`1 new message` / `N new messages`',
    description: 'Pluralised pill text for the number of new items.',
  },
  {
    name: 'latestLabel',
    type: 'string',
    default: "'Jump to latest'",
    description: 'Pill text when the reader is away but nothing new has arrived.',
  },
  {
    name: 'formatAnnouncement',
    type: '(count: number) => string',
    default: 'the pill text',
    description: 'What the polite live region says when items arrive while away.',
  },
  {
    name: 'announceDelay',
    type: 'number',
    default: '1000',
    description:
      'Window in ms over which arrivals are coalesced into one announcement, so a burst is read out once.',
  },
  {
    name: 'className',
    type: 'string',
    description:
      'Additional classes for the pill, typically its position (e.g. `absolute bottom-4 left-1/2 -translate-x-1/2`). Other button attributes are passed through.',
  },
]

const useJumpToLatestOptions = [
  {
    name: 'scrollRef',
    type: 'RefObject<HTMLElement | null>',
    description:
      'A plain scroll container to track. Use this or `listRef`. It may mount after the hook (e.g. behind a loading state) or be replaced; the listener follows the current element on every render.',
  },
  {
    name: 'listRef',
    type: 'RefObject<VirtualListHandle | null>',
    description:
      "A VirtualList's ref. Jumps use its `scrollToEnd` / `scrollToKey` / `scrollToIndex`. Use this or `scrollRef`.",
  },
  {
    name: 'keys',
    type: 'readonly (string | number)[]',
    description:
      'Item keys in list order. Lets the tracker tell new items from loaded history and forget deleted ones.',
  },
  {
    name: 'count',
    type: 'number',
    description:
      'Item count, when keys are not available. Every increase while away counts as new, so prepends cannot be told apart.',
  },
  {
    name: 'threshold',
    type: 'number',
    default: '32',
    description: "Distance in px from the end that still counts as at the end (VirtualList's default).",
  },
  {
    name: 'stickToEnd',
    type: 'boolean',
    default: 'false',
    description:
      'Plain scrollers only: keep a reader who is at the end there as items arrive. A VirtualList with `anchor="end"` already does this.',
  },
  {
    name: 'scrollToItem',
    type: "(target: { key, index }, behavior: 'auto' | 'smooth') => void",
    description:
      'Plain scrollers only: scroll the first unread item into view for `jumpTo="first-unread"`. Without it the pill falls back to the end.',
  },
]

const plainCode = `import { JumpToLatest, useJumpToLatest } from '@refraction-ui/react'

export function Chat({ messages }) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const jtl = useJumpToLatest({
    scrollRef,
    keys: messages.map((m) => m.id),
    stickToEnd: true,
  })

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        role="log"
        aria-live={jtl.atEnd ? 'polite' : 'off'}
        aria-label="Team chat"
        tabIndex={0}
        className="h-80 overflow-y-auto"
      >
        {messages.map((m) => <Message key={m.id} message={m} />)}
      </div>
      <JumpToLatest
        controller={jtl}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      />
    </div>
  )
}`

const virtualListCode = `import { JumpToLatest, useJumpToLatest, VirtualList, type VirtualListHandle } from '@refraction-ui/react'

export function Chat({ messages }) {
  const listRef = React.useRef<VirtualListHandle>(null)
  const jtl = useJumpToLatest({ listRef, keys: messages.map((m) => m.id) })

  return (
    <div className="relative">
      <VirtualList
        ref={listRef}
        items={messages}
        getItemKey={(m) => m.id}
        renderItem={(m) => <Message message={m} />}
        anchor="end"
        role="log"
        className="h-80"
        aria-label="Team chat"
      />
      <JumpToLatest
        controller={jtl}
        jumpTo="first-unread"
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      />
    </div>
  )
}`

export default function JumpToLatestPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Jump to Latest</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A pill that returns a scrolled-back reader to the newest item. It appears when the
          conversation is scrolled away from its end, counts what arrived since (“3 new messages”),
          and announces new arrivals politely. The <code className={code}>useJumpToLatest</code>{' '}
          hook tracks the scroll position of a plain scroller or a VirtualList.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Plain scroller</h2>
        <p className="text-sm text-muted-foreground">
          Pass a <code className={code}>scrollRef</code> and the item{' '}
          <code className={code}>keys</code>. Scroll up, then receive messages: the pill counts
          them. With <code className={code}>stickToEnd</code> a reader at the end stays there as
          messages arrive. The scroller can render later than the hook (behind a loading state)
          or be swapped for another; the hook moves its listener to whichever element the ref
          holds after each render.
        </p>
        <JumpToLatestExamples section="plain" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With VirtualList</h2>
        <p className="text-sm text-muted-foreground">
          Pass the VirtualList&apos;s ref as <code className={code}>listRef</code>. The hook uses
          the same at-end maths and threshold as the list, and jumps through its handle, so a
          bottom-anchored list resumes sticking to the end.
        </p>
        <JumpToLatestExamples section="virtual-list" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Jump to first unread</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>jumpTo=&quot;first-unread&quot;</code> takes the reader to the
          first item they missed. A VirtualList needs nothing more; a plain scroller provides{' '}
          <code className={code}>scrollToItem</code>. This example also overrides the pluralisation
          with <code className={code}>formatNewCount</code> and{' '}
          <code className={code}>latestLabel</code>.
        </p>
        <JumpToLatestExamples section="first-unread" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={plainCode} />
        <p className="text-sm text-muted-foreground">With a VirtualList:</p>
        <CodeBlock code={virtualListCode} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            The pill is a native button, so Tab reaches it and Enter or Space activates it. It has
            a visible focus ring and is at least 44 px tall.
          </li>
          <li>
            Its accessible name is its visible text (“3 new messages”, or “Jump to latest”); the
            arrow is decorative. The count is spelled out, never shown by colour alone.
          </li>
          <li>
            At the end the pill fades out but stays mounted, with{' '}
            <code className={code}>aria-hidden</code> and{' '}
            <code className={code}>tabIndex=-1</code>, so it is out of the tab order and the
            accessibility tree. If it had focus, focus moves to the scroller — give a plain
            scroller <code className={code}>tabIndex=&#123;0&#125;</code> so it can take it (and be
            scrolled from the keyboard).
          </li>
          <li>
            Arrivals while away are announced in a polite status region, coalesced over{' '}
            <code className={code}>announceDelay</code> so a burst is read once. Nothing is
            announced on mount or while the reader is at the end. Make the list itself a live log
            only while at the end (VirtualList&apos;s <code className={code}>role=&quot;log&quot;</code>{' '}
            does this) so new messages are never announced twice.
          </li>
          <li>
            Jumps scroll smoothly, and instantly when the reader prefers reduced motion; the pill
            appears and disappears without animating then too.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={jumpToLatestProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">useJumpToLatest options</h2>
        <PropsTable props={useJumpToLatestOptions} />
      </section>
    </div>
  )
}
