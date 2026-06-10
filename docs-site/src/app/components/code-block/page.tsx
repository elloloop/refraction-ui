import { CodeBlockExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const codeBlockProps = [
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes merged onto the container.',
  },
  {
    name: '...props',
    type: 'HTMLAttributes<HTMLDivElement>',
    description:
      'All standard div attributes are forwarded. `CodeBlockContent` forwards `pre` attributes, `CodeBlockHeader` forwards `div` attributes.',
  },
]

const usageCode = `import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockContent,
} from '@refraction-ui/react'

export function Example() {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <span>greet.js</span>
        <span>JavaScript</span>
      </CodeBlockHeader>
      <CodeBlockContent>{\`greet('world')\`}</CodeBlockContent>
    </CodeBlock>
  )
}`

export default function CodeBlockPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Code Block</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A styled container for displaying source code. Compose{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">CodeBlock</code> with an optional{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">CodeBlockHeader</code> and a{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">CodeBlockContent</code>. Built on the
          headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/code-block</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          A bare code block wrapping a <code className="text-xs bg-muted px-1 rounded">CodeBlockContent</code>.
        </p>
        <CodeBlockExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With header</h2>
        <p className="text-sm text-muted-foreground">
          Add a <code className="text-xs bg-muted px-1 rounded">CodeBlockHeader</code> for a filename or language label.
        </p>
        <CodeBlockExamples section="with-header" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-code-block" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={codeBlockProps} />
      </section>
    </div>
  )
}
