import { MarqueeStripExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const marqueeStripProps = [
  {
    name: 'label',
    type: 'string',
    description: 'Eyebrow label shown before the items (static mode only).',
  },
  {
    name: 'items',
    type: 'string[]',
    description: 'List of text items to display in the strip.',
  },
  {
    name: 'scroll',
    type: 'boolean',
    default: 'false',
    description:
      'When true, items scroll continuously using a CSS marquee animation. Requires a `@keyframes marquee` definition in your global CSS.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the container.',
  },
]

const usageCode = `import { MarqueeStrip } from '@refraction-ui/react'

// Static strip with a label
export function TechStack() {
  return (
    <MarqueeStrip
      label="Built with"
      items={['React', 'TypeScript', 'Tailwind CSS', 'Turborepo']}
    />
  )
}

// Scrolling strip (add @keyframes marquee to your global CSS)
export function ScrollingStrip() {
  return (
    <MarqueeStrip
      scroll
      items={['React', 'TypeScript', 'Tailwind CSS', 'Vitest', 'Storybook']}
    />
  )
}`

const keyframeCode = `/* Add to your global CSS for scroll mode */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}`

export default function MarqueeStripPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Marquee Strip</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A full-width label and tag strip for showcasing tech stacks, concept
          tags, or partner logos — supports a static flex-wrap layout or a
          continuously scrolling marquee animation.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Static strip</h2>
        <p className="text-sm text-muted-foreground">
          Default mode — items wrap naturally after the label. No CSS animation
          required.
        </p>
        <MarqueeStripExamples section="static" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Scrolling</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">scroll</code> to
          enable continuous marquee animation. Items are duplicated once
          internally for a seamless loop. You must add the{' '}
          <code className="text-xs bg-muted px-1 rounded">@keyframes marquee</code>{' '}
          definition to your global CSS.
        </p>
        <MarqueeStripExamples section="scrolling" />
        <CodeBlock frameworks={{ react: keyframeCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Long concept tags</h2>
        <p className="text-sm text-muted-foreground">
          Static mode handles long or many tags gracefully by wrapping them.
        </p>
        <MarqueeStripExamples section="concept-tags" />
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
        <PropsTable props={marqueeStripProps} />
      </section>
    </div>
  )
}
