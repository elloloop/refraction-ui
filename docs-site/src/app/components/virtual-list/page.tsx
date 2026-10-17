import { VirtualListExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const virtualListProps = [
  {
    name: 'items',
    type: 'readonly T[]',
    description: 'The full list of items. Only a window of them is mounted.',
  },
  {
    name: 'getItemKey',
    type: '(item: T, index: number) => string | number',
    description:
      'Stable identity per item. Measurements and the scroll position follow keys, which is what lets older items be prepended without the view jumping.',
  },
  {
    name: 'renderItem',
    type: '(item: T, index: number) => React.ReactNode',
    description: 'Renders one item. Its height is measured, including margins inside it.',
  },
  {
    name: 'estimatedItemSize',
    type: 'number',
    default: '48',
    description: 'Height in px assumed for items that have not been measured yet.',
  },
  {
    name: 'overscan',
    type: 'number',
    default: '4',
    description: 'Items mounted beyond each edge of the viewport.',
  },
  {
    name: 'anchor',
    type: "'start' | 'end'",
    default: "'start'",
    description:
      "'end' makes a history: it opens at the bottom, sits short content at the bottom, and sticks to the end while the reader is there.",
  },
  {
    name: 'atEndThreshold',
    type: 'number',
    default: '32',
    description: 'Distance in px from the end that still counts as at the end.',
  },
  {
    name: 'onAtEndChange',
    type: '(atEnd: boolean) => void',
    description: 'Called on mount with the initial value, then whenever at-end changes.',
  },
  {
    name: 'onRangeChange',
    type: '(range: { start: number; end: number }) => void',
    description:
      'Called when the visible range [start, end) changes (overscan excluded). Load older items when start reaches 0.',
  },
  {
    name: 'initialItemCount',
    type: 'number',
    default: '10',
    description:
      'Items rendered before the viewport is known — on the server and on the first client render.',
  },
  {
    name: 'role',
    type: "'list' | 'log'",
    default: "'list'",
    description:
      "'log' makes the scroller a live log (for chat and activity); it only announces additions while the reader is at the end.",
  },
  {
    name: 'itemClassName',
    type: 'string',
    description: 'Extra classes for every item wrapper.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Classes for the scroll container. Give it a height (for example h-96).',
  },
  {
    name: 'ref',
    type: 'React.Ref<VirtualListHandle>',
    description:
      'Imperative handle: scrollToIndex(index, { align, behavior }), scrollToKey(key, { align, behavior }), scrollToEnd({ behavior }), isAtEnd(), getScrollElement().',
  },
]

const usageCode = `import { VirtualList, type VirtualListHandle } from '@refraction-ui/react'

export function Conversation({ messages, loadOlder }) {
  const listRef = React.useRef<VirtualListHandle>(null)
  const [atEnd, setAtEnd] = React.useState(true)

  return (
    <>
      <VirtualList
        ref={listRef}
        items={messages}
        getItemKey={(m) => m.id}
        renderItem={(m) => <Message message={m} />}
        anchor="end"
        role="log"
        onAtEndChange={setAtEnd}
        onRangeChange={({ start }) => start === 0 && loadOlder()}
        className="h-[32rem]"
        aria-label="Conversation"
      />
      {!atEnd && (
        <button onClick={() => listRef.current?.scrollToEnd({ behavior: 'smooth' })}>
          Jump to latest
        </button>
      )}
    </>
  )
}`

const atEndCode = `import { isVirtualListAtEnd } from '@refraction-ui/react'

// The same at-end rule VirtualList uses, for any scroller.
const atEnd = isVirtualListAtEnd({
  scrollOffset: el.scrollTop,
  viewportSize: el.clientHeight,
  contentSize: el.scrollHeight,
  threshold: 32,
})`

const code = 'text-xs bg-muted px-1 rounded'

export default function VirtualListPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Virtual List</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A virtualised list for long, variable-height histories. It mounts only the rows near the
          viewport, measures each one, starts at the bottom, sticks there while you are at the end,
          and loads older rows above without the view jumping.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Ten thousand rows of different heights. Only a few dozen are in the DOM at any time;
          heights start from <code className={code}>estimatedItemSize</code> and are replaced by
          measurements as rows mount.
        </p>
        <VirtualListExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Bottom-anchored chat</h2>
        <p className="text-sm text-muted-foreground">
          With <code className={code}>anchor=&quot;end&quot;</code> the list opens at the newest
          message and follows new ones while you are at the end. Scroll up and it stops following;
          scroll to the top and the next 50 older messages are prepended while the message you were
          reading stays where it was.
        </p>
        <VirtualListExamples section="chat" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Scroll to an index</h2>
        <p className="text-sm text-muted-foreground">
          The ref handle scrolls to any row by index or key with{' '}
          <code className={code}>start</code>, <code className={code}>center</code>,{' '}
          <code className={code}>end</code> or <code className={code}>auto</code> alignment, and
          re-aims once the target row has been measured.
        </p>
        <VirtualListExamples section="scroll-to" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
        <p className="text-sm text-muted-foreground">
          The at-end rule is a pure function, so a custom scroller or a jump-to-latest button can
          share it:
        </p>
        <CodeBlock code={atEndCode} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            The scroller is a labelled tab stop with a visible focus ring, so the arrow keys, Page
            Up / Page Down, Home and End scroll it; new rows mount as it scrolls.
          </li>
          <li>
            Rows are list items with <code className={code}>aria-posinset</code> and{' '}
            <code className={code}>aria-setsize</code>, so a screen reader says “item 512 of 10,000”
            even though only a window is in the DOM.
          </li>
          <li>
            With <code className={code}>role=&quot;log&quot;</code> the list is a polite live region
            only while the reader is at the end. Scrolling back mounts old rows, which would
            otherwise be read out as new.
          </li>
          <li>The row holding keyboard focus stays mounted when it scrolls out of view.</li>
          <li>Smooth programmatic scrolling becomes instant when the reader prefers reduced motion.</li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={virtualListProps} />
      </section>
    </div>
  )
}
