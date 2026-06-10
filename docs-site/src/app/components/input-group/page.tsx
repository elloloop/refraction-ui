import { InputGroupExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const inputGroupProps = [
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description:
      'Lays the group out in a row or a column. Border-radius clipping on the first/last children adapts to match.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the group container.',
  },
  {
    name: '...props',
    type: 'React.HTMLAttributes<HTMLDivElement>',
    description: 'All standard div attributes (id, aria-label, etc.) are forwarded.',
  },
]

const usageCode = `import {
  InputGroup,
  InputGroupText,
  InputGroupButton,
} from '@refraction-ui/react'

export function MyComponent() {
  return (
    <InputGroup>
      <InputGroupText>$</InputGroupText>
      <input placeholder="0.00" />
      <InputGroupButton>Pay</InputGroupButton>
    </InputGroup>
  )
}`

export default function InputGroupPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Input Group</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          A flex container that visually joins inputs with text addons, icons, and buttons into a single
          seamless control. Built on the headless{' '}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/input-group</code>{' '}
          core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Text & addons</h2>
        <p className="text-sm text-muted-foreground">
          Use <code className="rounded bg-muted px-1 text-xs">InputGroupText</code> for inline labels like{' '}
          <code className="rounded bg-muted px-1 text-xs">$</code> or{' '}
          <code className="rounded bg-muted px-1 text-xs">https://</code>, and{' '}
          <code className="rounded bg-muted px-1 text-xs">InputGroupAddon</code> for bordered icon/text slots.
        </p>
        <InputGroupExamples section="addons" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-input-group" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With a button</h2>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 text-xs">InputGroupButton</code> sits flush against the input
          — perfect for search and subscribe fields.
        </p>
        <InputGroupExamples section="buttons" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Vertical orientation</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1 text-xs">orientation=&quot;vertical&quot;</code> to stack
          controls in a column. Pass the same orientation to addons and buttons so the radius clipping lines up.
        </p>
        <InputGroupExamples section="vertical" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 text-xs">InputGroupAddon</code> and{' '}
          <code className="rounded bg-muted px-1 text-xs">InputGroupButton</code> also accept the{' '}
          <code className="rounded bg-muted px-1 text-xs">orientation</code> prop;{' '}
          <code className="rounded bg-muted px-1 text-xs">InputGroupText</code> takes standard span attributes.
        </p>
        <PropsTable props={inputGroupProps} />
      </section>
    </div>
  )
}
