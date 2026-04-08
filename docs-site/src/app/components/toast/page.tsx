import { ToastExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const toastHookReturn = [
  { name: 'toast', type: "(message: string, opts?: { variant?: ToastVariant; duration?: number }) => string", description: 'Show a new toast. Returns the toast ID.' },
  { name: 'dismiss', type: '(id: string) => void', description: 'Dismiss a specific toast by ID.' },
  { name: 'toasts', type: 'ReadonlyArray<ToastEntry>', description: 'Current list of active toasts.' },
]

const toastVariantInfo = [
  { name: 'variant', type: "'default' | 'success' | 'error' | 'warning'", default: "'default'", description: 'Visual style of the toast notification.' },
  { name: 'duration', type: 'number', default: '3000', description: 'Auto-dismiss duration in ms. Set to 0 to disable auto-dismiss.' },
]

const usageCode = `import { ToastProvider, Toaster, useToast, Button } from '@refraction-ui/react'

function MyApp() {
  return (
    <ToastProvider>
      <MyComponent />
      <Toaster />
    </ToastProvider>
  )
}

function MyComponent() {
  const { toast } = useToast()

  return (
    <Button onClick={() => toast('File saved!', { variant: 'success' })}>
      Save
    </Button>
  )
}`

export default function ToastPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Hook</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Toast</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Notification toasts with auto-dismiss, hover pause, and 4 variants.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/toast</code> core.
        </p>
      </div>

      {/* Live Example — first */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Trigger Examples</h2>
        <p className="text-sm text-muted-foreground">Click a button to trigger a toast. Toasts auto-dismiss after 3 seconds. Hover to pause the timer.</p>
        <ToastExamples />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-toast" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <div className="h-px bg-border" />

      {/* useToast return */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">useToast() Return</h2>
        <PropsTable props={toastHookReturn} />
      </section>

      {/* Toast options */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Toast Options</h2>
        <PropsTable props={toastVariantInfo} />
      </section>
    </div>
  )
}
