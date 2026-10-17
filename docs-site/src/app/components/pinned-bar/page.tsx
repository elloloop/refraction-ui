import { PinnedBarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const pinnedBarProps = [
  {
    name: 'items',
    type: 'PinnedBarItem[]',
    description:
      'The pinned messages in display order: `{ id, author, snippet }`. `id` must be stable. Renders nothing when empty.',
  },
  {
    name: 'index',
    type: 'number',
    description: 'Controlled index of the pin being shown. Out-of-range values are clamped.',
  },
  {
    name: 'defaultIndex',
    type: 'number',
    default: '0',
    description:
      'Initial index for uncontrolled usage. Uncontrolled, the bar follows the shown pin when pins are added or removed around it.',
  },
  {
    name: 'onIndexChange',
    type: '(index: number) => void',
    description: 'Called with the new index when previous / next is pressed.',
  },
  {
    name: 'onOpen',
    type: '(item: PinnedBarItem) => void',
    description:
      'Makes the author + snippet a button that jumps to that message. Without it the snippet is plain text.',
  },
  {
    name: 'onOpenList',
    type: '() => void',
    description: 'Shows the "Show all pinned messages" button.',
  },
  {
    name: 'onUnpin',
    type: '(item: PinnedBarItem) => void',
    description: 'Shows the unpin button; called with the current pin. Remove it from `items` yourself.',
  },
  {
    name: 'collapsed',
    type: 'boolean',
    description: 'Controlled collapsed state.',
  },
  {
    name: 'defaultCollapsed',
    type: 'boolean',
    default: 'false',
    description: 'Initial collapsed state for uncontrolled usage.',
  },
  {
    name: 'onCollapsedChange',
    type: '(collapsed: boolean) => void',
    description: 'Called when the collapse toggle is pressed.',
  },
  {
    name: 'labels',
    type: 'Partial<PinnedBarLabels>',
    description:
      'Override any string: `region`, `previous`, `next`, `openList`, `unpin`, `collapse`, `expand`, and the functions `position(current, total)` ("2 of 5"), `collapsedSummary(total)` and `announcement(item, position)`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the root. Other `div` attributes are forwarded too.',
  },
]

const usageCode = `import { PinnedBar } from '@refraction-ui/react'

export function ChannelHeader({ pins, onJump, onShowPins, onUnpin }) {
  return (
    <PinnedBar
      items={pins} // [{ id, author, snippet }]
      onOpen={(pin) => onJump(pin.id)}
      onOpenList={onShowPins}
      onUnpin={(pin) => onUnpin(pin.id)}
    />
  )
}`

const controlledCode = `import { PinnedBar, locatePinnedBarIndex } from '@refraction-ui/react'

const [index, setIndex] = React.useState(0)

<PinnedBar
  items={pins}
  index={index}
  onIndexChange={setIndex}
  onUnpin={(pin) => {
    const remaining = pins.filter((p) => p.id !== pin.id)
    setPins(remaining)
    // Same rule the uncontrolled bar uses: follow the pin, or keep the slot.
    setIndex(Math.max(locatePinnedBarIndex(remaining, { id: pin.id, index }), 0))
  }}
/>`

export default function PinnedBarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pinned Bar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          The pinned-items strip above a conversation: the current pin&apos;s author and a
          one-line snippet with its position, previous / next, the full list, unpin, and a
          collapse toggle — so pinned messages stay one click away.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Previous and next <strong>wrap</strong>: next on the last pin goes back to the first.
          Clicking the snippet calls <code className={code}>onOpen</code> to jump to the message;
          the list button calls <code className={code}>onOpenList</code>.
        </p>
        <PinnedBarExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Unpin (controlled)</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>onUnpin</code> hands you the current pin; remove it from{' '}
          <code className={code}>items</code>. This example starts on the last pin: unpinning it
          moves to the new last pin rather than jumping back to the first.
        </p>
        <PinnedBarExamples section="unpin" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Collapsed</h2>
        <p className="text-sm text-muted-foreground">
          Collapsing hides the pin and controls and shows a count instead. Control it with{' '}
          <code className={code}>collapsed</code> / <code className={code}>onCollapsedChange</code>{' '}
          or leave it uncontrolled with <code className={code}>defaultCollapsed</code>.
        </p>
        <PinnedBarExamples section="collapsed" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Single pin</h2>
        <p className="text-sm text-muted-foreground">
          With one pin there is nothing to step through, so previous / next are not rendered.
        </p>
        <PinnedBarExamples section="single" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom labels</h2>
        <p className="text-sm text-muted-foreground">
          Every string is overridable through <code className={code}>labels</code>, including the
          position format (here <code className={code}>2/5</code>) and the announcement.
        </p>
        <PinnedBarExamples section="labels" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
        <p className="text-sm text-muted-foreground">
          Uncontrolled, the bar keeps showing the same pin when others are added or removed, and
          shows the pin that slid into place when the current one is removed. With a controlled{' '}
          <code className={code}>index</code>, apply the same rule with{' '}
          <code className={code}>locatePinnedBarIndex</code>:
        </p>
        <CodeBlock frameworks={{ react: controlledCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The bar is a <code className={code}>role=&quot;region&quot;</code> landmark named
            &quot;Pinned messages&quot; (<code className={code}>labels.region</code>), so screen
            reader users can jump to it.
          </li>
          <li>
            When the current pin changes (previous / next, or the shown pin is removed) a polite{' '}
            <code className={code}>role=&quot;status&quot;</code> live region announces its
            position, author and snippet. Nothing is announced on first render. Long snippets are
            shortened in the announcement only.
          </li>
          <li>
            Every control is a native button reachable with Tab. Icon controls are{' '}
            <code className={code}>IconButton</code>s: named, with a tooltip and a 44 × 44 px hit
            area. Because navigation wraps, previous / next never become disabled, so focus stays
            on the button you pressed.
          </li>
          <li>
            The snippet button is described by the position text
            (<code className={code}>aria-describedby</code>) and has a 44 px minimum height. The
            snippet truncates to one line visually but its full text stays available to assistive
            tech.
          </li>
          <li>
            The collapse toggle is a disclosure: <code className={code}>aria-expanded</code> and{' '}
            <code className={code}>aria-controls</code>, with the chevron direction and label
            changing too — nothing is conveyed by colour alone.
          </li>
          <li>
            Uses semantic tokens only, rem-based text, the shared focus-visible ring, and no
            motion beyond colour transitions, which stop under{' '}
            <code className={code}>prefers-reduced-motion</code>.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={pinnedBarProps} />
      </section>
    </div>
  )
}
