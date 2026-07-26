import { DropdownMenuExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const dropdownProps = [
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Callback on open change.' },
  { name: 'children', type: 'ReactNode', description: 'Trigger + Content with items.' },
]

const triggerProps = [
  {
    name: 'asChild',
    type: 'boolean',
    default: 'false',
    description:
      'Merge the trigger props/behavior onto the child element instead of rendering a <button> around it. Use with styled triggers like <Button> to avoid nesting a button in a button.',
  },
]

const itemProps = [
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the item: removes it from tab order and blocks selection.' },
  { name: 'onSelect', type: '() => void', description: 'Callback fired when the item is selected via click or Enter/Space, before the menu closes.' },
]

const usageCode = `import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@refraction-ui/react'

export function MyComponent() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => {}}>Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {}}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`

export default function DropdownMenuPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dropdown Menu</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A dropdown menu with items, separators, labels, and disabled items. Accessible keyboard navigation and ARIA support.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/dropdown-menu</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">A menu with labels, separators, actionable items, and a disabled item.</p>
        <DropdownMenuExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={dropdownProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">DropdownMenuTrigger props</h2>
        <PropsTable props={triggerProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">DropdownMenuItem props</h2>
        <PropsTable props={itemProps} />
      </section>
    </div>
  )
}
