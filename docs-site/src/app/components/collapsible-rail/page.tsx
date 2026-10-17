import { CollapsibleRailExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const hookOptions = [
  {
    name: 'storageKey',
    type: 'string',
    description:
      'localStorage key the wide-viewport width is remembered under. Without it, the width is remembered for the life of the component. If storage is unavailable the rail still works and warns once in development.',
  },
  {
    name: 'defaultCollapsed',
    type: 'boolean',
    default: 'false',
    description: 'The wide-viewport width when nothing is remembered, and the width of the server render.',
  },
]

const hookResult = [
  {
    name: 'state',
    type: '{ collapsed: boolean; open: boolean; mobile: boolean }',
    description:
      'Pass these to the rail parts. `open` is false until the viewport is known, so a server render never paints an open overlay.',
  },
  {
    name: 'toggle',
    type: '() => void',
    description: 'Flip the width. On a closed overlay, open it instead.',
  },
  { name: 'expand / collapse', type: '() => void', description: 'Set the width.' },
  {
    name: 'openMobile / closeMobile',
    type: '() => void',
    description: 'Open or close the overlay on a narrow viewport; they do nothing on a wide one.',
  },
  {
    name: 'onChromeClick',
    type: '(event: React.MouseEvent) => void',
    description:
      'Pass as the rail’s `onClick`: a click on its empty space flips the width; clicks on links and controls inside it, or on portals rendered from it, do not.',
  },
]

const railProps = [
  { name: 'collapsed', type: 'boolean', description: 'Collapsed (icons only) or full width.' },
  {
    name: 'open',
    type: 'boolean',
    description: 'The rail is on screen; on a narrow viewport, whether the overlay is open.',
  },
  {
    name: 'mobile',
    type: 'boolean',
    default: 'false',
    description:
      'The viewport is narrow. A closed overlay is then inert, opening it moves focus to its first control, and closing it returns focus.',
  },
  { name: 'expandedWidth', type: 'string', default: "'14rem'", description: 'Full width, any CSS length.' },
  { name: 'collapsedWidth', type: 'string', default: "'4rem'", description: 'Collapsed width, any CSS length.' },
  {
    name: 'className',
    type: 'string',
    description: 'The rail’s surface, such as a background and a border.',
  },
]

const edgeToggleProps = [
  { name: 'collapsed', type: 'boolean', description: 'The rail is collapsed; the control then offers to expand it.' },
  { name: 'open', type: 'boolean', description: 'The rail is on screen; the control hides with a closed overlay.' },
  {
    name: 'tone',
    type: "'default' | 'tertiary'",
    default: "'default'",
    description: 'The surface the rail is drawn on: the card surface, or the theme’s tertiary accent.',
  },
  { name: 'expandLabel', type: 'string', default: "'Expand navigation'", description: 'Accessible name while collapsed.' },
  { name: 'collapseLabel', type: 'string', default: "'Collapse navigation'", description: 'Accessible name while expanded.' },
]

const backdropProps = [
  {
    name: 'aria-label',
    type: 'string',
    description: 'Required. The name of the dismiss action, such as “Close navigation”.',
  },
  { name: 'onClick', type: '() => void', description: 'Close the rail: pass `closeMobile`.' },
]

const usageCode = `import {
  CollapsibleRail,
  RailBackdrop,
  RailEdgeToggle,
  useCollapsibleRail,
} from '@refraction-ui/react'

export function Layout({ children }: { children: React.ReactNode }) {
  const rail = useCollapsibleRail({ storageKey: 'app-rail-collapsed' })
  const { collapsed, open, mobile } = rail.state

  return (
    <div className="flex h-dvh">
      {mobile && open && <RailBackdrop aria-label="Close navigation" onClick={rail.closeMobile} />}
      <CollapsibleRail
        collapsed={collapsed}
        open={open}
        mobile={mobile}
        className="border-e border-border bg-card"
        onClick={rail.onChromeClick}
      >
        <RailEdgeToggle collapsed={collapsed} open={open} onClick={rail.toggle} />
        <nav aria-label="Main">{/* links: icon + label, label sr-only when collapsed */}</nav>
      </CollapsibleRail>
      <main className="flex-1">
        {mobile && <button onClick={rail.openMobile}>Open navigation</button>}
        {children}
      </main>
    </div>
  )
}`

export default function CollapsibleRailPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Collapsible Rail</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A side navigation rail with a full and a collapsed width, remembered on
          the device, that becomes an off-canvas overlay on a narrow screen. Use it
          inside any layout; it brings its own state, edge control and backdrop.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Full and collapsed</h2>
        <p className="text-sm text-muted-foreground">
          The round control on the edge, or a click on the rail’s empty space,
          switches the width. Keep each link’s label for assistive tech when
          collapsed, for example with{' '}
          <code className="text-xs bg-muted px-1 rounded">sr-only</code>.
        </p>
        <CollapsibleRailExamples section="default" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tertiary surface</h2>
        <p className="text-sm text-muted-foreground">
          Draw the rail on the theme’s tertiary accent and give the edge control{' '}
          <code className="text-xs bg-muted px-1 rounded">tone=&quot;tertiary&quot;</code>{' '}
          to match.
        </p>
        <CollapsibleRailExamples section="tertiary" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Narrow screens</h2>
        <p className="text-sm text-muted-foreground">
          Below 768px the rail leaves the layout. It is closed, and inert, until
          your own control calls <code className="text-xs bg-muted px-1 rounded">openMobile</code>;
          it then slides in at its collapsed width over a backdrop and takes
          focus. The backdrop, Escape or <code className="text-xs bg-muted px-1 rounded">closeMobile</code>{' '}
          close it and focus returns to the control that opened it. Using the
          rail on a narrow screen never changes the width remembered for a wide one.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} language="tsx" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">useCollapsibleRail options</h2>
        <PropsTable props={hookOptions} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">useCollapsibleRail result</h2>
        <PropsTable props={hookResult} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CollapsibleRail props</h2>
        <PropsTable props={railProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">RailEdgeToggle props</h2>
        <PropsTable props={edgeToggleProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">RailBackdrop props</h2>
        <PropsTable props={backdropProps} />
      </section>
    </div>
  )
}
