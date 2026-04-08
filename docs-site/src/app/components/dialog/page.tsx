import { DialogExample } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const dialogProps = [
  {
    name: 'open',
    type: 'boolean',
    description: 'Controlled open state.',
  },
  {
    name: 'defaultOpen',
    type: 'boolean',
    default: 'false',
    description: 'Initial open state for uncontrolled usage.',
  },
  {
    name: 'onOpenChange',
    type: '(open: boolean) => void',
    description: 'Callback when open state changes.',
  },
  {
    name: 'modal',
    type: 'boolean',
    default: 'true',
    description: 'Whether the dialog behaves as a modal.',
  },
]

const subComponents = [
  {
    name: 'DialogTrigger',
    type: 'ButtonHTMLAttributes',
    description: 'Button that toggles the dialog open/closed.',
  },
  {
    name: 'DialogOverlay',
    type: 'HTMLAttributes<HTMLDivElement>',
    description: 'Backdrop overlay that closes dialog on click.',
  },
  {
    name: 'DialogContent',
    type: 'HTMLAttributes<HTMLDivElement>',
    description: 'The dialog content panel. Handles Escape key.',
  },
  {
    name: 'DialogHeader',
    type: 'HTMLAttributes<HTMLDivElement>',
    description: 'Header section with flex column layout.',
  },
  {
    name: 'DialogTitle',
    type: 'HTMLAttributes<HTMLHeadingElement>',
    description: 'Dialog title (h2) linked via aria-labelledby.',
  },
  {
    name: 'DialogDescription',
    type: 'HTMLAttributes<HTMLParagraphElement>',
    description: 'Dialog description linked via aria-describedby.',
  },
  {
    name: 'DialogFooter',
    type: 'HTMLAttributes<HTMLDivElement>',
    description: 'Footer section with action buttons layout.',
  },
  {
    name: 'DialogClose',
    type: 'ButtonHTMLAttributes',
    description: 'Button that closes the dialog.',
  },
]

const usageCode = `import {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
} from '@refraction-ui/react'

export function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogOverlay>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}`

export default function DialogPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Compound
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dialog</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A modal dialog with compound components for trigger, overlay, content, and actions.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/dialog</code> core.
        </p>
      </div>

      {/* Live Example — first */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live Example</h2>
        <p className="text-sm text-muted-foreground">
          Click a button to open a dialog. Press Escape or click the overlay to close.
        </p>
        <DialogExample />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-dialog" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dialog Props</h2>
        <PropsTable props={dialogProps} />
      </section>

      {/* Sub-components */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Compound Components</h2>
        <PropsTable
          props={subComponents.map((c) => ({
            name: c.name,
            type: c.type,
            description: c.description,
          }))}
        />
      </section>
    </div>
  )
}
