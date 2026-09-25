import { NativeSelectExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const props = [
  {
    name: "size",
    type: "'sm' | 'default' | 'lg'",
    default: "'default'",
    description: "Visual size (shadows the native size attribute).",
  },
  {
    name: "containerClassName",
    type: "string",
    description: "Classes for the positioning wrapper (width, margins).",
  },
  {
    name: "className",
    type: "string",
    description: "Classes for the <select>.",
  },
  {
    name: "…select attributes",
    type: "SelectHTMLAttributes",
    description: "value, defaultValue, onChange, name, disabled, required, aria-* — all passed to the <select>, which also receives the ref.",
  },
]

const usageCode = "import { NativeSelect } from '@refraction-ui/react'\n\nexport function StatusFilter({ value, onChange }) {\n  return (\n    <NativeSelect aria-label=\"Status\" value={value} onChange={(e) => onChange(e.target.value)}>\n      <option value=\"all\">All</option>\n      <option value=\"open\">Open</option>\n      <option value=\"closed\">Closed</option>\n    </NativeSelect>\n  )\n}"

const astroUsageCode = "---\nimport { NativeSelect } from '@refraction-ui/astro'\n---\n\n<NativeSelect aria-label=\"Status\" name=\"status\">\n  <option value=\"open\">Open</option>\n  <option value=\"closed\">Closed</option>\n</NativeSelect>"

export default function NativeSelectPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Native Select</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A native <select> with the input look and a chevron: the platform picker on mobile, type-to-select, form submission and change events for free. Use Select when you need a custom listbox.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">Options are ordinary <option> elements; every native attribute passes through.</p>
        <NativeSelectExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">sm, default and lg match the Input sizes.</p>
        <NativeSelectExamples section="sizes" />
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
