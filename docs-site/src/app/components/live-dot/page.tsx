import { LiveDotExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const liveDotProps = [
  {
    name: 'live',
    type: 'boolean',
    default: 'true',
    description:
      'While true, a halo swells and fades around the dot. `false` draws a plain dot.',
  },
  {
    name: 'color',
    type: "'primary' | 'success' | 'destructive' | 'warning' | 'info' | 'pending' | 'neutral' | 'muted'",
    default: "'success'",
    description: 'Semantic colour token for the dot and its halo. Never a raw CSS colour.',
  },
  {
    name: 'size',
    type: "'xs' | 'sm' | 'md' | 'lg' | number",
    default: "'sm'",
    description:
      'Named size (0.375rem, 0.5rem, 0.625rem, 0.75rem) or a positive number of rem.',
  },
  {
    name: 'label',
    type: 'string',
    description:
      'Accessible name for a dot that stands alone (renders `role="img"`). Omit it when adjacent text explains the dot; it is then `aria-hidden`. `aria-label` is treated the same.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the root.',
  },
]

const usageCode = `import { LiveDot } from '@refraction-ui/react'

export function RecordingStatus({ recording }: { recording: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <LiveDot live={recording} color="destructive" />
      {recording ? 'Recording' : 'Stopped'}
    </span>
  )
}`

const code = 'text-xs bg-muted px-1 rounded'

export default function LiveDotPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Dot</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A small dot that breathes while something is live — recording,
          checking, or on a call — so an active state never looks frozen.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          While <code className={code}>live</code> is true a halo swells and fades
          around the dot; set it to <code className={code}>false</code> for a plain dot.
        </p>
        <LiveDotExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Colours</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>color</code> takes a semantic token name, so the dot
          follows light, dark and system themes.
        </p>
        <LiveDotExamples section="colors" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">
          Pick a step on the scale, or pass a number of rem when it must match
          something custom.
        </p>
        <LiveDotExamples section="sizes" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With adjacent text</h2>
        <p className="text-sm text-muted-foreground">
          The usual pattern: the text says what is live and the dot shows that it
          is happening now.
        </p>
        <LiveDotExamples section="in-context" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Standalone</h2>
        <p className="text-sm text-muted-foreground">
          When no text explains the dot, give it a{' '}
          <code className={code}>label</code> so screen readers announce it.
        </p>
        <LiveDotExamples section="standalone" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Decorative by default (<code className={code}>aria-hidden</code>): meaning
            comes from the adjacent text, never from colour alone.
          </li>
          <li>
            With a <code className={code}>label</code> it renders as{' '}
            <code className={code}>role=&quot;img&quot;</code> with that accessible name.
          </li>
          <li>
            Under <code className={code}>prefers-reduced-motion</code> the halo stops
            animating and holds still as a soft ring.
          </li>
          <li>
            It is not interactive, so it takes no focus. Put it beside a focusable
            control when the live state can be changed.
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
        <PropsTable props={liveDotProps} />
      </section>
    </div>
  )
}
