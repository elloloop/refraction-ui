import { ToastExamples, ToastActionExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const toastHookReturn = [
  { name: 'toast', type: '(message: string, opts?: ToastOptions) => string', description: 'Show a new toast. Returns the toast ID. toast(message) and toast(message, { variant, duration }) work as before.' },
  { name: 'dismiss', type: '(id: string) => void', description: 'Dismiss a specific toast by ID.' },
  { name: 'toasts', type: 'ReadonlyArray<ToastEntry>', description: 'Current list of active toasts.' },
]

const toastVariantInfo = [
  { name: 'variant', type: "'default' | 'success' | 'error' | 'warning'", default: "'default'", description: 'Visual style of the toast notification.' },
  { name: 'duration', type: 'number', default: '3000', description: 'Auto-dismiss duration in ms. Set to 0 to disable auto-dismiss. The countdown pauses while the toast is hovered or holds focus.' },
  { name: 'title', type: 'string', description: 'Short heading shown above the message and announced first.' },
  { name: 'action', type: '{ label: string; onClick: () => void }', description: 'An action button such as Undo. Choosing it closes the toast, then runs onClick once. Give action toasts a longer duration (or 0) so there is time to reach the button.' },
]

const toasterProps = [
  { name: 'aria-label', type: 'string', default: "'Notifications'", description: 'Name of the landmark region that holds the toasts. Translate it with the rest of your UI.' },
  { name: 'dismissLabel', type: 'string', default: "'Dismiss'", description: "Accessible name of each toast's dismiss button." },
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
}

// A title and an Undo action
toast('It is no longer in your drafts.', {
  title: 'Draft deleted',
  duration: 6000,
  action: { label: 'Undo', onClick: () => restoreDraft() },
})`

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
          Notification toasts with an optional title and action, auto-dismiss that pauses on hover and focus,
          screen-reader announcements, and 4 variants.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/toast</code> core.
        </p>
      </div>

      {/* Live Example — first */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Trigger Examples</h2>
        <p className="text-sm text-muted-foreground">Click a button to trigger a toast. Toasts auto-dismiss after 3 seconds. Hover or focus a toast to pause the timer.</p>
        <ToastExamples />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Title and Action</h2>
        <p className="text-sm text-muted-foreground">Delete a draft, then choose Undo in the toast to bring it back.</p>
        <ToastActionExamples />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
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

      {/* Toaster props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Toaster Props</h2>
        <PropsTable props={toasterProps} />
      </section>

      {/* Accessibility */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>The Toaster is a labelled landmark region, so screen-reader users can jump to it.</li>
          <li>Each new toast is announced once through a live region that is present from the start: errors interrupt (assertive), everything else waits its turn (polite). The announcement reads the title, the message and the action label.</li>
          <li>The countdown pauses while a toast is hovered or holds keyboard focus, and resumes with the time it had left.</li>
          <li>Escape closes the focused toast. When a focused toast closes, focus returns to where it was before it entered the toasts.</li>
          <li>The action and dismiss buttons are native buttons with a visible focus ring for keyboard focus only. The dismiss glyph is hidden from assistive technology; the button is named by dismissLabel.</li>
          <li>Transitions are turned off for users who prefer reduced motion.</li>
        </ul>
      </section>
    </div>
  )
}
