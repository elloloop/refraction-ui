import { AdaptiveTabNavExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const navProps = [
  {
    name: 'items',
    type: 'readonly { id: string; label: string; icon?: ReactNode }[]',
    description:
      'The sections, in order, with unique ids. The label names the tab; the icon is decorative and hidden from assistive tech.',
  },
  {
    name: 'active',
    type: 'string | null',
    description: 'The id of the section on screen, or `null` for a page that belongs to none (no tab is lit).',
  },
  {
    name: 'onSelect',
    type: '(id: string) => void',
    description:
      'Called with the chosen id, including the current one. Navigate here, with your router or by setting `active`.',
  },
  {
    name: 'aria-label',
    type: 'string',
    description: 'Names the navigation landmark, such as “Sections”. Recommended when the page has more than one nav.',
  },
  { name: 'className', type: 'string', description: 'Merged onto the `nav`.' },
]

const usageCode = `import { AdaptiveTabNav } from '@refraction-ui/react'
import { usePathname, useRouter } from 'next/navigation'

const sections = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'inbox', label: 'Inbox', icon: <Inbox /> },
  { id: 'files', label: 'Files', icon: <Folder /> },
]

export function TopBar() {
  const router = useRouter()
  const first = usePathname().split('/')[1]
  const active =
    sections.find((s) => s.id === first)?.id ?? null

  return (
    <header className="flex items-center gap-4 px-4">
      <Logo />
      <AdaptiveTabNav
        items={sections}
        active={active}
        onSelect={(id) => router.push(\`/\${id}\`)}
        aria-label="Sections"
        className="flex-1"
      />
    </header>
  )
}`

const insetCode = `// Below 768px the nav covers the bottom of the
// screen, so leave room for it:
<main className="[@media(max-width:767px)]:pb-24">
  {children}
</main>

// Or in script, with the query the nav docks at:
import {
  ADAPTIVE_TAB_NAV_DOCK_MEDIA_QUERY,
} from '@refraction-ui/react'

const docked = window.matchMedia(
  ADAPTIVE_TAB_NAV_DOCK_MEDIA_QUERY,
).matches`

const targetCode = `// Tabs are at least 2.75rem (44px) tall. Raise
// it for a surface that needs larger targets:
const roomy = {
  '--rfr-tab-nav-target': '3.5rem',
} as React.CSSProperties

<AdaptiveTabNav style={roomy} {...props} />`

export default function AdaptiveTabNavPage() {
  return (
    // The demo docks to this page's viewport when narrow, so the page leaves room for it.
    <div className="space-y-12 [@media(max-width:767px)]:pb-24">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Adaptive Tab Nav</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          One primary navigation for a handful of top-level sections: pill tabs
          in your top bar on a wide screen, a tab bar docked to the bottom of the
          screen on a narrow one. It is the same element at every width, so a
          page never carries two copies of its navigation.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">In a top bar</h2>
        <p className="text-sm text-muted-foreground">
          Each tab is a native button: Tab moves between them, Enter or Space
          chooses one, and the section on screen is marked{' '}
          <code className="text-xs bg-muted px-1 rounded">aria-current=&quot;page&quot;</code>.
          The tabs do not navigate themselves; <code className="text-xs bg-muted px-1 rounded">onSelect</code>{' '}
          hands you the id, so a client-side router keeps the page alive. In a
          crowded bar the nav shrinks and the tabs truncate their labels rather
          than widen the page, so give it the room it needs, for example with{' '}
          <code className="text-xs bg-muted px-1 rounded">flex-1</code> or a row of its own.
        </p>
        <AdaptiveTabNavExamples section="top-bar" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Narrow screens</h2>
        <p className="text-sm text-muted-foreground">
          Below 768px the nav leaves the top bar and is fixed to the bottom of
          the viewport, clear of a phone&apos;s home indicator; the tabs share
          its width and stack the icon over the label. Narrow this window to
          see the demo above dock. Leave room at the bottom of your content
          for it.
        </p>
        <CodeBlock code={insetCode} language="tsx" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Touch target</h2>
        <CodeBlock code={targetCode} language="tsx" />
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
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={navProps} />
      </section>
    </div>
  )
}
