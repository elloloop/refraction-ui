import { ToastExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const toastHookReturn = [
  {
    name: 'toast',
    type: "(message: string, opts?: { variant?: ToastVariant; duration?: number }) => string",
    description: 'Show a new toast. Returns the toast ID.',
  },
  {
    name: 'dismiss',
    type: '(id: string) => void',
    description: 'Dismiss a specific toast by ID.',
  },
  {
    name: 'toasts',
    type: 'ReadonlyArray<ToastEntry>',
    description: 'Current list of active toasts.',
  },
]

const toastVariantInfo = [
  {
    name: 'variant',
    type: "'default' | 'success' | 'error' | 'warning'",
    default: "'default'",
    description: 'Visual style of the toast notification.',
  },
  {
    name: 'duration',
    type: 'number',
    default: '3000',
    description: 'Auto-dismiss duration in ms. Set to 0 to disable auto-dismiss.',
  },
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
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Toast</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Notification toasts with auto-dismiss, hover pause, and 4 variants.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">@refraction-ui/toast</code> core.
        </p>
      </div>

      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Trigger Examples</h2>
        <p className="text-sm text-muted-foreground">
          Click a button to trigger a toast. Toasts auto-dismiss after 3 seconds. Hover to pause the timer.
        </p>
        <ToastExamples />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      {/* useToast return */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">useToast() Return</h2>
        <PropsTable props={toastHookReturn} />
      </section>

      {/* Toast options */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Toast Options</h2>
        <PropsTable props={toastVariantInfo} />
      </section>
    </div>
  )
}
