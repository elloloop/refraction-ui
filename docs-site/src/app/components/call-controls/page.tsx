import { CallControlsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const callControlsProps = [
  {
    name: 'size',
    type: "'sm' | 'md'",
    default: "'md'",
    description: 'Visual size of the toolbar and its buttons.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the toolbar container.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'CallControlButton elements to render inside the toolbar.',
  },
]

const callControlButtonProps = [
  {
    name: 'label',
    type: 'string',
    description: 'Accessible label (aria-label) and screen-reader text.',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Icon node rendered inside the button.',
  },
  {
    name: 'tone',
    type: "'default' | 'active' | 'destructive'",
    default: "'default'",
    description:
      'Visual tone: default (neutral), active (on/highlighted), destructive (leave/muted).',
  },
  {
    name: 'pressed',
    type: 'boolean',
    description:
      'Toggleable state — adds aria-pressed. Omit for non-toggleable controls.',
  },
  {
    name: 'size',
    type: "'sm' | 'md'",
    default: "'md'",
    description: 'Visual size of the button.',
  },
  {
    name: 'onClick',
    type: '() => void',
    description: 'Click handler.',
  },
]

const usageCode = `import { CallControls, CallControlButton } from '@refraction-ui/react'

export function MeetingBar() {
  const [micOn, setMicOn] = React.useState(true)

  return (
    <CallControls>
      <CallControlButton
        label={micOn ? 'Mute mic' : 'Unmute mic'}
        tone={micOn ? 'active' : 'destructive'}
        pressed={micOn}
        onClick={() => setMicOn(v => !v)}
      />
      <CallControlButton label="Share screen" />
      <CallControlButton label="Leave" tone="destructive" />
    </CallControls>
  )
}`

export default function CallControlsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Call Controls</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A meeting bottom toolbar with composable round control buttons — mic,
          camera, screen-share, reactions, and a destructive leave/end button.
          Fully accessible with role="toolbar", aria-label, and aria-pressed for
          toggleable controls.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic bar</h2>
        <p className="text-sm text-muted-foreground">
          Compose any set of <code className="text-xs bg-muted px-1 rounded">CallControlButton</code> elements
          inside <code className="text-xs bg-muted px-1 rounded">CallControls</code>. The leave button uses
          <code className="text-xs bg-muted px-1 rounded">tone="destructive"</code>.
        </p>
        <CallControlsExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Toggled (muted) states</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">pressed</code> to mark a control as
          toggled. Use <code className="text-xs bg-muted px-1 rounded">tone="active"</code> when on
          and <code className="text-xs bg-muted px-1 rounded">tone="destructive"</code> when muted/off
          to signal the disabled state with red.
        </p>
        <CallControlsExamples section="toggled" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With leave button</h2>
        <p className="text-sm text-muted-foreground">
          The leave/end button always uses <code className="text-xs bg-muted px-1 rounded">tone="destructive"</code>.
          It is not toggleable and therefore receives no <code className="text-xs bg-muted px-1 rounded">pressed</code> prop.
        </p>
        <CallControlsExamples section="leave" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CallControls props</h2>
        <PropsTable props={callControlsProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CallControlButton props</h2>
        <PropsTable props={callControlButtonProps} />
      </section>
    </div>
  )
}
