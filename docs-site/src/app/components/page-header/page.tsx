import { PageHeaderExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const props = [
  {
    name: "title",
    type: "React.ReactNode",
    description: "The page title (required).",
  },
  {
    name: "kicker",
    type: "React.ReactNode",
    description: "Optional eyebrow above the title.",
  },
  {
    name: "description",
    type: "React.ReactNode",
    description: "Optional supporting copy under the title.",
  },
  {
    name: "actions",
    type: "React.ReactNode",
    description: "Optional actions (buttons, menus) on the trailing edge.",
  },
  {
    name: "as",
    type: "'h1' | 'h2' | 'h3'",
    default: "'h1'",
    description: "Heading element for the title.",
  },
  {
    name: "className",
    type: "string",
    description: "Merged onto the root <header>.",
  },
]

const usageCode = "import { PageHeader, Button } from '@refraction-ui/react'\n\nexport function ProjectsPage() {\n  return (\n    <PageHeader\n      kicker=\"Workspace\"\n      title=\"Projects\"\n      description=\"Everything your team is working on.\"\n      actions={<Button>New project</Button>}\n    />\n  )\n}"

const astroUsageCode = "---\nimport { PageHeader } from '@refraction-ui/astro'\n---\n\n<PageHeader kicker=\"Workspace\" title=\"Projects\" description=\"Everything your team is working on.\">\n  <button slot=\"actions\">New project</button>\n</PageHeader>"

export default function PageHeaderPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Page Header</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          The heading cluster at the top of an application page: an optional kicker above an app-sized title, an optional description, and a trailing row of actions. For centred marketing headings use Section Head.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">A title with a kicker and a description.</p>
        <PageHeaderExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With actions</h2>
        <p className="text-sm text-muted-foreground">Actions sit on the trailing edge and wrap under the title on narrow screens.</p>
        <PageHeaderExamples section="with-actions" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Heading level</h2>
        <p className="text-sm text-muted-foreground">Use the as prop to render the title as an h2 or h3 inside a nested view.</p>
        <PageHeaderExamples section="heading-level" />
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
        <PropsTable props={props} />
      </section>
    </div>
  )
}
