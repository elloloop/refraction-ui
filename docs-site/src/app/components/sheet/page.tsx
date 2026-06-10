import { SheetExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const sheetProps = [
  {
    name: 'open',
    type: 'boolean',
    description: 'Controlled open state. Pair with `onOpenChange`.',
  },
  {
    name: 'defaultOpen',
    type: 'boolean',
    default: 'false',
    description: 'Initial open state when uncontrolled.',
  },
  {
    name: 'onOpenChange',
    type: '(open: boolean) => void',
    description: 'Called whenever the open state changes.',
  },
  {
    name: 'side',
    type: "'top' | 'right' | 'bottom' | 'left'",
    default: "'right'",
    description: 'Edge the sheet slides in from. Overridable per `SheetContent`.',
  },
  {
    name: 'modal',
    type: 'boolean',
    default: 'true',
    description: 'Marks the content as a modal dialog for assistive tech.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Trigger and content compound components.',
  },
]

const contentProps = [
  {
    name: 'side',
    type: "'top' | 'right' | 'bottom' | 'left'",
    description: 'Overrides the side set on the parent `Sheet`.',
  },
  {
    name: 'withOverlay',
    type: 'boolean',
    default: 'true',
    description: 'Renders a backdrop and closes the sheet on outside click.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the content panel.',
  },
]

const usageCode = `import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@refraction-ui/react'

export function MyComponent() {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes, then save.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Cancel</SheetClose>
          <SheetClose>Save changes</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}`

export default function SheetPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sheet</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A panel that slides in from any edge of the screen, rendered through a portal with focus
          management, an Escape-to-close handler, and ARIA dialog wiring.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Compose a <code className="text-xs bg-muted px-1 rounded">SheetTrigger</code> with{' '}
          <code className="text-xs bg-muted px-1 rounded">SheetContent</code>. State is managed for you;
          click the backdrop, press Escape, or use a <code className="text-xs bg-muted px-1 rounded">SheetClose</code> to dismiss.
        </p>
        <SheetExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-sheet" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sides</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">side</code> to slide in from{' '}
          <code className="text-xs bg-muted px-1 rounded">top</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">right</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">bottom</code>, or{' '}
          <code className="text-xs bg-muted px-1 rounded">left</code>.
        </p>
        <SheetExamples section="sides" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sheet props</h2>
        <PropsTable props={sheetProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">SheetContent props</h2>
        <PropsTable props={contentProps} />
      </section>
    </div>
  )
}
