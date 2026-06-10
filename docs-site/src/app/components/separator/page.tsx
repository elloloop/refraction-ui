import { SeparatorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const separatorProps = [
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Direction of the separator line.',
  },
  {
    name: 'label',
    type: 'React.ReactNode',
    description:
      'Optional centered label (the "labeled divider" variant). Only meaningful for horizontal separators.',
  },
  {
    name: 'decorative',
    type: 'boolean',
    default: 'true',
    description:
      'When true the separator is purely visual (role="none"). Set false to expose it as a semantic role="separator" for assistive tech.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { Separator } from '@refraction-ui/react'

export function MyComponent() {
  return (
    <div>
      <p>Above</p>
      <Separator />
      <p>Below</p>

      {/* Labeled divider */}
      <Separator label="or" />

      {/* Vertical */}
      <div className="flex h-6 items-center gap-3">
        <span>Home</span>
        <Separator orientation="vertical" />
        <span>Docs</span>
      </div>
    </div>
  )
}`

export default function SeparatorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Separator</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A thin rule that visually divides content. Supports horizontal and
          vertical orientations plus an optional centered label (a labeled
          divider).
        </p>
      </div>

      {/* Basic */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          A horizontal rule spanning the full width of its container.
        </p>
        <SeparatorExamples section="basic" />
      </section>

      {/* Labeled */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Labeled</h2>
        <p className="text-sm text-muted-foreground">
          Pass a <code className="text-xs bg-muted px-1 rounded">label</code> to
          render a centered caption flanked by two lines.
        </p>
        <SeparatorExamples section="labeled" />
      </section>

      {/* Vertical */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Vertical</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">orientation=&quot;vertical&quot;</code>{' '}
          to divide inline content. The parent needs a defined height.
        </p>
        <SeparatorExamples section="vertical" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-separator" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={separatorProps} />
      </section>
    </div>
  )
}
