import { MasteryBarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const masteryBarProps = [
  {
    name: 'value',
    type: 'number',
    description: 'Progress value (0–100). Values outside this range are clamped.',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Label shown on the right side of the header row.',
  },
  {
    name: 'leadingLabel',
    type: 'string',
    description: 'Label shown on the left side of the header row.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Visual size (height) of the track.',
  },
  {
    name: 'muted',
    type: 'boolean',
    default: 'false',
    description: 'Renders the fill at reduced opacity for secondary/inactive states.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the wrapper.',
  },
]

const usageCode = `import { MasteryBar } from '@refraction-ui/react'

export function SkillProgress() {
  return (
    <div className="space-y-4">
      <MasteryBar value={30} leadingLabel="React" label="30%" />
      <MasteryBar value={65} leadingLabel="TypeScript" label="65%" />
      <MasteryBar value={90} leadingLabel="CSS" label="90%" />
    </div>
  )
}`

export default function MasteryBarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mastery Bar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A persistent, labelled linear progress bar for visualising skill or
          concept mastery — distinct from an activity spinner or loading bar.
          Supports optional leading and trailing labels with three track sizes.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Pass a <code className="text-xs bg-muted px-1 rounded">value</code> between 0 and 100.
          Values outside this range are automatically clamped.
        </p>
        <MasteryBarExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With labels</h2>
        <p className="text-sm text-muted-foreground">
          Use <code className="text-xs bg-muted px-1 rounded">leadingLabel</code> (left) and{' '}
          <code className="text-xs bg-muted px-1 rounded">label</code> (right) to add a header row
          above the track — useful for naming the skill and showing the percentage.
        </p>
        <MasteryBarExamples section="labeled" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">
          Three track heights are available: <code className="text-xs bg-muted px-1 rounded">sm</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">md</code> (default), and{' '}
          <code className="text-xs bg-muted px-1 rounded">lg</code>.
        </p>
        <MasteryBarExamples section="sizes" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation available via @refraction-ui/astro-mastery-bar -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={masteryBarProps} />
      </section>
    </div>
  )
}
