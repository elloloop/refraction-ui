import { TableOfContentsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const tableOfContentsProps = [
  {
    name: 'containerRef',
    type: 'React.RefObject<HTMLElement | null>',
    description:
      'Ref to the element whose headings build the list. Falls back to document.body when omitted.',
  },
  {
    name: 'selectors',
    type: 'string',
    default: "'h2, h3, h4'",
    description: 'CSS selectors used to collect headings within the container.',
  },
  {
    name: 'onActiveIdChange',
    type: '(id: string) => void',
    description: 'Called with the id of the heading currently scrolled into view.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the nav element.',
  },
]

const usageCode = `import { useRef } from 'react'
import { TableOfContents } from '@refraction-ui/react'

export function Doc() {
  const containerRef = useRef<HTMLElement | null>(null)

  return (
    <div className="grid grid-cols-[1fr_200px] gap-8">
      <article ref={containerRef}>
        <h2 id="intro">Introduction</h2>
        <h2 id="usage">Usage</h2>
        <h3 id="install">Installation</h3>
      </article>

      <TableOfContents containerRef={containerRef} selectors="h2, h3" />
    </div>
  )
}`

export default function TableOfContentsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Table of Contents</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Auto-generates a navigable outline from the headings inside a container and highlights the
          section currently in view using an intersection observer.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Default</h2>
        <p className="text-sm text-muted-foreground">
          Headings are parsed from the referenced container; nested levels are indented automatically.
        </p>
        <TableOfContentsExamples section="default" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-table-of-contents" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <p className="text-sm text-muted-foreground">
          Renders nothing when no matching headings are found. Each heading needs an{' '}
          <code className="text-xs bg-muted px-1 rounded">id</code> so the links can anchor to it.
        </p>
        <PropsTable props={tableOfContentsProps} />
      </section>
    </div>
  )
}
