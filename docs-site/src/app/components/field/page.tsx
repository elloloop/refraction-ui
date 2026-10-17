import { FieldExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const fieldProps = [
  {
    name: 'label',
    type: 'React.ReactNode',
    description: 'The visible label. It is also the control’s accessible name.',
  },
  {
    name: 'children',
    type: 'React.ReactNode | ((control: FieldControlProps) => React.ReactNode)',
    description:
      'The control. A single element gets an id (its own, or a generated one) and is described by the hint. Pass a function for a control nested inside a wrapper: it receives `{ id, aria-describedby }` to spread onto the control.',
  },
  {
    name: 'hint',
    type: 'React.ReactNode',
    description: 'Helper copy under the control. Its id is `<control id>-hint`.',
  },
  {
    name: 'htmlFor',
    type: 'string',
    description:
      'The id of the control the label names, when the control is not the direct child. The child is then left untouched. Required in Astro.',
  },
  {
    name: 'layout',
    type: "'stacked' | 'inline'",
    default: "'stacked'",
    description: '`stacked` puts the label above the control; `inline` puts it after a checkbox or switch.',
  },
  {
    name: 'labelTone',
    type: "'default' | 'eyebrow'",
    default: "'default'",
    description: 'A regular form label, or a small uppercase eyebrow for dense filter rows and toolbars.',
  },
  {
    name: 'grow',
    type: 'boolean',
    default: 'false',
    description: 'Grow to fill spare room in a wrapping flex row.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the root element.',
  },
]

const usageCode = `import { Button, Field, Input, Switch } from '@refraction-ui/react'

export function Settings() {
  const [digest, setDigest] = React.useState(true)

  return (
    <>
      <Field label="Email" hint="We only use it to send sign-in links.">
        <Input type="email" />
      </Field>

      <Field label="Weekly digest" layout="inline">
        <Switch checked={digest} onCheckedChange={setDigest} />
      </Field>

      {/* A control inside a wrapper: spread the props onto it. */}
      <Field label="Password" hint="At least 12 characters.">
        {(control) => (
          <div className="flex gap-2">
            <Input type="password" {...control} />
            <Button type="button" variant="outline">Show</Button>
          </div>
        )}
      </Field>
    </>
  )
}`

const astroUsageCode =
  "---\nimport { Field } from '@refraction-ui/astro'\n---\n\n<!-- Astro cannot add attributes to slotted markup, so the control carries\n     the id, and points aria-describedby at `<htmlFor>-hint`. -->\n<Field label=\"Email\" htmlFor=\"email\" hint=\"We only use it to send sign-in links.\">\n  <input id=\"email\" type=\"email\" aria-describedby=\"email-hint\" />\n</Field>"

export default function FieldPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Field</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A labelled form control with an optional hint. It works with any
          control and any form library, or none: the label names the control by
          id and the hint describes it, so a control with its own buttons keeps
          a clean accessible name. For forms bound to react-hook-form, use the
          Form component instead.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Stacked</h2>
        <p className="text-sm text-muted-foreground">
          The label sits above the control. The hint below it becomes the
          control’s description, read after its name.
        </p>
        <FieldExamples section="stacked" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Inline</h2>
        <p className="text-sm text-muted-foreground">
          With <code className="text-xs bg-muted px-1 rounded">layout=&quot;inline&quot;</code>{' '}
          the label follows a checkbox or switch, and clicking it toggles the
          control. A hint lines up under the label.
        </p>
        <FieldExamples section="inline" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Filter row</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">labelTone=&quot;eyebrow&quot;</code>{' '}
          gives a compact caption for dense rows, and{' '}
          <code className="text-xs bg-muted px-1 rounded">grow</code> lets one field
          take the spare room as the row wraps.
        </p>
        <FieldExamples section="row" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Nested control</h2>
        <p className="text-sm text-muted-foreground">
          When the control sits inside a wrapper, pass a function as the child
          and spread what it receives onto the control. Alternatively pass{' '}
          <code className="text-xs bg-muted px-1 rounded">htmlFor</code> with the
          control’s id and set its{' '}
          <code className="text-xs bg-muted px-1 rounded">aria-describedby</code>{' '}
          to <code className="text-xs bg-muted px-1 rounded">&lt;id&gt;-hint</code>.
        </p>
        <FieldExamples section="nested" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: astroUsageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={fieldProps} />
      </section>
    </div>
  )
}
