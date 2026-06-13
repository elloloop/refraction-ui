import { PricingCardExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const pricingCardProps = [
  {
    name: 'name',
    type: 'string',
    description: 'Plan name (e.g. "Pro", "Starter").',
  },
  {
    name: 'price',
    type: 'string',
    description: 'Price string (e.g. "$29", "Free").',
  },
  {
    name: 'period',
    type: 'string',
    description: 'Billing period or qualifier shown beside the price (e.g. "/ month").',
  },
  {
    name: 'features',
    type: 'string[]',
    description: 'List of included features rendered as a checklist.',
  },
  {
    name: 'cta',
    type: 'string',
    description: 'Label for the call-to-action button or link.',
  },
  {
    name: 'ctaVariant',
    type: "'default' | 'outline'",
    default: "'default'",
    description:
      'Visual style of the CTA. Use `default` (filled) on featured plans and `outline` on others.',
  },
  {
    name: 'ctaHref',
    type: 'string',
    description:
      'When provided, the CTA renders as an `<a>` element navigating to this URL.',
  },
  {
    name: 'onCtaClick',
    type: 'React.MouseEventHandler<HTMLButtonElement>',
    description: 'Click handler for the CTA button (ignored when `ctaHref` is set).',
  },
  {
    name: 'badge',
    type: 'string',
    description: 'Optional badge label shown above the plan name (e.g. "Most popular").',
  },
  {
    name: 'description',
    type: 'string',
    description: 'Short marketing description shown beneath the price.',
  },
  {
    name: 'featured',
    type: 'boolean',
    default: 'false',
    description: 'Highlights the card with a primary-colour ring.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the card container.',
  },
]

const usageCode = `import { PricingCard } from '@refraction-ui/react'

export function PricingSection() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <PricingCard
        name="Starter"
        price="Free"
        features={['5 projects', 'Community support', '1 GB storage']}
        cta="Get started"
        ctaVariant="outline"
        ctaHref="/signup"
      />
      <PricingCard
        badge="Most popular"
        name="Pro"
        price="$29"
        period="/ month"
        description="Everything you need to grow."
        features={['Unlimited projects', 'Priority support', '100 GB storage']}
        cta="Start free trial"
        featured
        ctaHref="/signup?plan=pro"
      />
      <PricingCard
        name="Pay-per-use"
        price="$0.001"
        period="/ request"
        description="Scale as you go — no upfront commitment."
        features={['No seat limits', 'Usage billing', 'SLA available']}
        cta="Contact sales"
        ctaVariant="outline"
        ctaHref="/contact"
      />
    </div>
  )
}`

export default function PricingCardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pricing Card</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A self-contained pricing plan card with an optional badge, feature
          checklist, and a full-width CTA. Featured plans get a primary-colour
          ring to draw the eye.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic plan</h2>
        <p className="text-sm text-muted-foreground">
          A simple free-tier card with an outline CTA linking to the sign-up
          page.
        </p>
        <PricingCardExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Featured plan</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">featured</code> to
          highlight the recommended plan with a primary ring and a filled CTA.
          Add a <code className="text-xs bg-muted px-1 rounded">badge</code> for
          extra emphasis.
        </p>
        <PricingCardExamples section="featured" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pay-per-use text price</h2>
        <p className="text-sm text-muted-foreground">
          The <code className="text-xs bg-muted px-1 rounded">price</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">period</code> props
          accept any string, so usage-based pricing renders cleanly alongside
          fixed plans.
        </p>
        <PricingCardExamples section="payperuse" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={pricingCardProps} />
      </section>
    </div>
  )
}
