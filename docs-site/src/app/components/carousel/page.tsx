import { CarouselExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const carouselProps = [
  {
    name: 'type',
    type: "'single' | 'multiple'",
    default: "'single'",
    description:
      '`single` keeps one item open at a time; `multiple` lets any number expand independently.',
  },
  {
    name: 'collapsible',
    type: 'boolean',
    default: 'false',
    description: 'When `type="single"`, allows the open item to be toggled fully closed.',
  },
  {
    name: 'defaultValue',
    type: 'string | string[]',
    description: 'Uncontrolled initial open item(s). Use a string for `single`, an array for `multiple`.',
  },
  {
    name: 'value',
    type: 'string | string[]',
    description: 'Controlled open item(s). Pair with `onValueChange`.',
  },
  {
    name: 'onValueChange',
    type: '(value: string | string[]) => void',
    description: 'Called whenever the open item(s) change.',
  },
]

const itemProps = [
  {
    name: 'CarouselItem.value',
    type: 'string',
    description: 'Required unique identifier used to track the item’s open state.',
  },
  {
    name: 'CarouselTrigger',
    type: 'button',
    description: 'Clickable header that toggles its parent item. Renders a rotating chevron.',
  },
  {
    name: 'CarouselContent',
    type: 'div',
    description: 'Collapsible body shown only when the item is open (hidden via the `hidden` attribute otherwise).',
  },
]

const usageCode = `import {
  Carousel,
  CarouselItem,
  CarouselTrigger,
  CarouselContent,
} from '@refraction-ui/react'

export function MyComponent() {
  return (
    <Carousel type="single" collapsible defaultValue="shipping">
      <CarouselItem value="shipping">
        <CarouselTrigger>How long does shipping take?</CarouselTrigger>
        <CarouselContent>Orders arrive in 3–5 business days.</CarouselContent>
      </CarouselItem>
      <CarouselItem value="returns">
        <CarouselTrigger>What is your return policy?</CarouselTrigger>
        <CarouselContent>Returns accepted within 30 days.</CarouselContent>
      </CarouselItem>
    </Carousel>
  )
}`

export default function CarouselPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Carousel</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A collapsible, expand/collapse panel set for FAQs and disclosure sections. Compose
          it from <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">Carousel</code>,{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">CarouselItem</code>,{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">CarouselTrigger</code>, and{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">CarouselContent</code>.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Single (collapsible)</h2>
        <p className="text-sm text-muted-foreground">
          Only one panel is open at a time. With{' '}
          <code className="text-xs bg-muted px-1 rounded">collapsible</code>, clicking the open
          panel closes it.
        </p>
        <CarouselExamples section="single" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-carousel" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Multiple</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">type=&quot;multiple&quot;</code> to let
          several panels stay open at once.
        </p>
        <CarouselExamples section="multiple" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={carouselProps} />
        <p className="text-sm text-muted-foreground">Sub-components</p>
        <PropsTable props={itemProps} />
      </section>
    </div>
  )
}
