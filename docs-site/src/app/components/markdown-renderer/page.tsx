import { MarkdownRendererExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const markdownProps = [
  { name: 'content', type: 'string', description: 'Markdown string to render.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { MarkdownRenderer } from '@refraction-ui/react-markdown-renderer'
export function MyComponent() {
  return <MarkdownRenderer content="# Hello **World**" />
}`
export default function MarkdownRendererPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Markdown Renderer</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Renders markdown content as styled HTML with prose typography.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/markdown-renderer</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Rendered markdown with headings, lists, and code blocks.</p>
        <MarkdownRendererExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-markdown-renderer" />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={markdownProps} /></section>
    </div>
  )
}
