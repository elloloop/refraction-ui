import { InputExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const inputProps = [
  {
    name: 'size',
    type: "'sm' | 'default' | 'lg'",
    default: "'default'",
    description: 'Size of the input.',
  },
  {
    name: 'type',
    type: "'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'",
    default: "'text'",
    description: 'HTML input type.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the input.',
  },
  {
    name: 'readOnly',
    type: 'boolean',
    default: 'false',
    description: 'Makes the input read-only.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Marks the input as required.',
  },
  {
    name: 'aria-invalid',
    type: 'boolean',
    description: 'Marks the input as invalid for validation feedback.',
  },
  {
    name: 'placeholder',
    type: 'string',
    description: 'Placeholder text.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { Input } from '@refraction-ui/react'

export function MyForm() {
  return (
    <form className="space-y-4">
      <Input placeholder="Your name" />
      <Input type="email" placeholder="Email address" />
      <Input type="password" placeholder="Password" />
    </form>
  )
}`

export default function InputPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Input</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A styled text input with size variants and validation states.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">@refraction-ui/input</code> core.
        </p>
      </div>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">
          Three size options to fit different layout needs.
        </p>
        <InputExamples section="sizes" />
      </section>

      {/* Types */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Input Types</h2>
        <p className="text-sm text-muted-foreground">
          Supports standard HTML input types with appropriate behavior.
        </p>
        <InputExamples section="types" />
      </section>

      {/* States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">States</h2>
        <p className="text-sm text-muted-foreground">
          Disabled, read-only, required, and invalid states.
        </p>
        <InputExamples section="states" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Props</h2>
        <PropsTable props={inputProps} />
      </section>
    </div>
  )
}
