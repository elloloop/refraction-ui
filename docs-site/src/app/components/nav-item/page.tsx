import { NavItemExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const navItemProps = [
  {
    name: 'label',
    type: 'string',
    description: 'Visible label. When `collapsed`, it becomes the tooltip and the accessible name.',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Icon shown before the label, or alone when collapsed.',
  },
  {
    name: 'activeIcon',
    type: 'React.ReactNode',
    description: 'Icon shown instead of `icon` while `selected` (e.g. a filled variant).',
  },
  {
    name: 'count',
    type: 'number',
    description: 'How much waits at this destination. Zero, negative or NaN hides the badge.',
  },
  {
    name: 'maxCount',
    type: 'number',
    default: '99',
    description: 'Cap for the visible count; above it the badge reads `"<maxCount>+"`.',
  },
  {
    name: 'selected',
    type: 'boolean',
    default: 'false',
    description: 'The current destination. Sets `aria-current="page"`, swaps to `activeIcon` and shows the indicator bar.',
  },
  {
    name: 'collapsed',
    type: 'boolean',
    default: 'false',
    description: 'Icon-only rail item: a 44 px square, count on the icon corner, label as tooltip.',
  },
  {
    name: 'onTap',
    type: '(event: React.MouseEvent<HTMLElement>) => void',
    description: 'Called when the item is activated. `onClick` is also honoured.',
  },
  {
    name: 'semanticLabel',
    type: 'string',
    description: 'Replaces the composed accessible name verbatim.',
  },
  {
    name: 'formatCountLabel',
    type: '(count: number, display: string) => string',
    default: '(_, display) => `${display} unread`',
    description: 'Wording for the count in the accessible name. Receives the raw count and the capped text ("99+").',
  },
  {
    name: 'liveDot',
    type: 'React.ReactNode',
    description: 'Optional live indicator, at the row end or on the icon corner when collapsed.',
  },
  {
    name: 'asChild',
    type: 'boolean',
    default: 'false',
    description: 'Render the single child element (e.g. a router link) instead of a `<button>`. The child\'s own children are replaced by the item content.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { NavItem } from '@refraction-ui/react'

export function Sidebar({ current, onNavigate, unread }) {
  return (
    <nav aria-label="Workspace">
      <NavItem
        label="Chats"
        icon={<ChatIcon />}
        activeIcon={<ChatIconFilled />}
        count={unread}
        selected={current === 'chats'}
        onTap={() => onNavigate('chats')}
      />
      {/* Render as a link */}
      <NavItem asChild label="Calls" icon={<CallIcon />}>
        <a href="/calls" />
      </NavItem>
    </nav>
  )
}`

export default function NavItemPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Nav Item</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A sidebar or rail destination that says how much waits there: icon,
          label and a capped count badge, as a button or a link.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Click an item to select it. The selected item gets{' '}
          <code className={code}>aria-current=&quot;page&quot;</code>, its{' '}
          <code className={code}>activeIcon</code>, a bolder label and an indicator bar.
        </p>
        <NavItemExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Counts</h2>
        <p className="text-sm text-muted-foreground">
          Counts above <code className={code}>maxCount</code> (99 by default) show as
          &quot;99+&quot;. The accessible name speaks the count (&quot;Inbox, 99+
          unread&quot;); pass <code className={code}>formatCountLabel</code> to change
          the wording or language.
        </p>
        <NavItemExamples section="counts" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Collapsed rail</h2>
        <p className="text-sm text-muted-foreground">
          With <code className={code}>collapsed</code>, the count moves to the
          icon&apos;s corner and the label appears as a tooltip on hover or focus.
        </p>
        <NavItemExamples section="collapsed" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">As a link</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>asChild</code> merges the item onto your link
          element (an <code className={code}>&lt;a&gt;</code> or a router link).
        </p>
        <NavItemExamples section="links" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live dot</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>liveDot</code> takes any node, such as a LiveDot,
          and places it at the row end or on the icon corner. Say what it means in{' '}
          <code className={code}>semanticLabel</code>.
        </p>
        <NavItemExamples section="live" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The accessible name is the label plus the count (&quot;Chats, 2
            unread&quot;). The visual badge is <code className={code}>aria-hidden</code>{' '}
            so it is not read twice.
          </li>
          <li>
            Selection is announced with <code className={code}>aria-current=&quot;page&quot;</code>{' '}
            and shown by weight, an indicator bar and the active icon, not by colour alone.
          </li>
          <li>
            Every item is at least 44 px tall; collapsed items are 44 px squares.
            Focus shows a visible ring.
          </li>
          <li>
            The collapsed tooltip opens on hover and keyboard focus and closes on
            blur or <kbd>Escape</kbd>. Its entrance animation stops under{' '}
            <code className={code}>prefers-reduced-motion</code>. Toggling{' '}
            <code className={code}>collapsed</code> keeps keyboard focus on the item.
          </li>
          <li>
            The live dot is visual only inside the item&apos;s name; include what it
            means in <code className={code}>semanticLabel</code>.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={navItemProps} />
      </section>
    </div>
  )
}
