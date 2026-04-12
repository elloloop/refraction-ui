import { CommandExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const commandProps = [
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Callback when open state changes.' },
  { name: 'filter', type: '(value: string, search: string) => boolean', description: 'Custom filter function.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
  { name: 'children', type: 'ReactNode', description: 'CommandInput + CommandList with groups and items.' },
]

const usageCode = `import {
  Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator,
} from '@refraction-ui/react-command'

export function MyComponent() {
  return (
    <Command>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => {}}>Search</CommandItem>
          <CommandItem onSelect={() => {}}>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}`

export default function CommandPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A searchable command palette with groups, items, separators, and keyboard navigation.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/command</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">A command palette with grouped items and search filtering.</p>
        <CommandExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-command" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={commandProps} />
      </section>
    </div>
  )
}
