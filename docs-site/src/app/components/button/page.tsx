import { ButtonExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const buttonProps = [
  {
    name: 'variant',
    type: "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'",
    default: "'default'",
    description: 'Visual style of the button.',
  },
  {
    name: 'size',
    type: "'xs' | 'sm' | 'default' | 'lg' | 'icon'",
    default: "'default'",
    description: 'Size of the button.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a spinner and disables interaction.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the button.',
  },
  {
    name: 'asChild',
    type: 'boolean',
    default: 'false',
    description: 'Render as child element (e.g. wrap an <a> tag).',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { Button } from '@refraction-ui/react'

export function MyComponent() {
  return (
    <div className="flex gap-2">
      <Button variant="default">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
      <Button loading>Saving...</Button>
    </div>
  )
}`

export default function ButtonPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Button</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A clickable button with variant, size, loading, and disabled support.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">@refraction-ui/button</code> core.
        </p>
      </div>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Variants</h2>
        <p className="text-sm text-muted-foreground">
          Six built-in visual variants for different contexts.
        </p>
        <ButtonExamples section="variants" />
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">
          Five sizes from extra-small to large, plus an icon-only size.
        </p>
        <ButtonExamples section="sizes" />
      </section>

      {/* States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">States</h2>
        <p className="text-sm text-muted-foreground">
          Loading shows a spinner and disables interaction. Disabled greys out the button.
        </p>
        <ButtonExamples section="states" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Props</h2>
        <PropsTable props={buttonProps} />
      </section>
    </div>
  )
}
