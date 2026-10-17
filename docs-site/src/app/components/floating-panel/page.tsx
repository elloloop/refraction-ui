import { FloatingPanelExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const cornerType = "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'"

const floatingPanelProps = [
  {
    name: 'label',
    type: 'string',
    description: 'Required accessible name of the panel region (e.g. "Call with Ada").',
  },
  {
    name: 'header',
    type: 'React.ReactNode',
    description: 'Visible header content next to the drag handle (caller name, timer).',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'The collapsible body. It stays mounted (hidden) while collapsed.',
  },
  {
    name: 'corner',
    type: cornerType,
    description: 'Controlled corner.',
  },
  {
    name: 'defaultCorner',
    type: cornerType,
    default: "'bottom-right'",
    description: 'Initial corner for uncontrolled usage.',
  },
  {
    name: 'onCornerChange',
    type: '(corner: FloatingPanelCorner) => void',
    description: 'Called with the corner the user moved the panel to (drop or arrow key).',
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
    description: 'Called when the collapse control is toggled.',
  },
  {
    name: 'margin',
    type: 'number',
    default: '16',
    description: 'Gap between the panel and the viewport edges, in CSS pixels.',
  },
  {
    name: 'handleLabel',
    type: 'string',
    default: "'Move panel'",
    description: 'Accessible name of the drag handle.',
  },
  {
    name: 'handleDescription',
    type: 'string',
    default: "'Use the arrow keys to move the panel to another corner.'",
    description: 'Screen-reader hint on the drag handle (aria-describedby).',
  },
  {
    name: 'collapseLabel',
    type: 'string',
    default: "'Collapse panel'",
    description: 'Accessible name of the collapse control while expanded.',
  },
  {
    name: 'expandLabel',
    type: 'string',
    default: "'Expand panel'",
    description: 'Accessible name of the collapse control while collapsed.',
  },
  {
    name: 'formatCornerAnnouncement',
    type: '(corner: FloatingPanelCorner) => string',
    default: '"Panel moved to bottom right"',
    description: 'Live-region text announced after the panel lands in a new corner.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes, e.g. a width such as w-72.',
  },
]

const usageCode = `import { FloatingPanel, VideoTile, type FloatingPanelCorner } from '@refraction-ui/react'

export function CallPreview() {
  const [corner, setCorner] = React.useState<FloatingPanelCorner>('bottom-right')

  return (
    <FloatingPanel
      label="Call with Ada"
      header="Ada Lovelace · 04:12"
      corner={corner}
      onCornerChange={setCorner}
      className="w-80"
    >
      <VideoTile name="Ada Lovelace" />
    </FloatingPanel>
  )
}`

export default function FloatingPanelPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Floating Panel</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A small, non-modal window that rests in a corner of the viewport — like a mini preview
          of an ongoing call while the user works elsewhere. Drag it by its handle and it snaps
          to the nearest corner; it stays inside the viewport when the window resizes.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Uncontrolled: it starts in <code className={code}>defaultCorner</code> (bottom right)
          and keeps track of where the user moves it. The chevron collapses the body to the
          header bar.
        </p>
        <FloatingPanelExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Mini call window</h2>
        <p className="text-sm text-muted-foreground">
          Compose a <code className={code}>VideoTile</code> as the body for a picture-in-picture
          style call preview.
        </p>
        <FloatingPanelExamples section="call" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Controlled</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className={code}>corner</code> + <code className={code}>onCornerChange</code>{' '}
          and <code className={code}>collapsed</code> +{' '}
          <code className={code}>onCollapsedChange</code> to own the state (e.g. to remember the
          corner between sessions). <code className={code}>margin</code> sets the gap to the
          edges.
        </p>
        <FloatingPanelExamples section="controlled" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The panel is a <code className={code}>role=&quot;region&quot;</code> named by{' '}
            <code className={code}>label</code>, not a dialog: it never takes focus when it
            appears, traps nothing, has no <code className={code}>aria-modal</code> and leaves the
            page behind it fully interactive. Being a named landmark, screen-reader users can
            still jump straight to it.
          </li>
          <li>
            The drag handle is a native button named &quot;Move panel&quot;, reachable with Tab,
            with a 44 × 44 px target and a visible focus ring. Arrow keys move the panel to the
            adjacent corner (Up/Down change the top/bottom edge, Left/Right the side); at an edge
            the key does nothing rather than wrapping. Every move is announced in a polite live
            region (&quot;Panel moved to top left&quot;).
          </li>
          <li>
            The collapse control is an <code className={code}>IconButton</code> with{' '}
            <code className={code}>aria-expanded</code> and{' '}
            <code className={code}>aria-controls</code>; its name switches between
            &quot;Collapse panel&quot; and &quot;Expand panel&quot;, and the chevron flips, so the
            state is not shown by colour.
          </li>
          <li>
            The snap glides into place only after a user move and is instant under{' '}
            <code className={code}>prefers-reduced-motion: reduce</code>. Text selection is
            suspended while dragging, and touch dragging does not scroll the page.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={floatingPanelProps} />
      </section>
    </div>
  )
}
