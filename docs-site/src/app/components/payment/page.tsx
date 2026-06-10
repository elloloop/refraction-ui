import { PaymentExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const paymentProps = [
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Dims the surface and blocks pointer interaction with its contents.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'The payment form / content rendered inside the styled card surface.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the card container.',
  },
]

const usageCode = `import { Payment } from '@refraction-ui/react'

export function MyComponent() {
  return (
    <Payment>
      <h3 className="text-xl font-semibold">Payment details</h3>
      <p className="text-sm text-muted-foreground">Enter your card to continue.</p>
      <input placeholder="Card number" />
      <button>Pay $49.00</button>
    </Payment>
  )
}`

export default function PaymentPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A styled card surface for building checkout and payment forms. It provides the framed
          container and a <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">disabled</code> state;
          you compose the fields and actions inside. Built on the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/payment</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Wrap your form fields and a pay action inside{' '}
          <code className="text-xs bg-muted px-1 rounded">Payment</code>. The component owns the card framing;
          the inner markup is entirely yours.
        </p>
        <PaymentExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-payment" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Disabled</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">disabled</code> while a payment is processing
          to dim the surface and block interaction.
        </p>
        <PaymentExamples section="disabled" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={paymentProps} />
      </section>
    </div>
  )
}
