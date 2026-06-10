import { SliderExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const sliderProps = [
  {
    name: 'value',
    type: 'number',
    description: 'The current value of the slider (controlled).',
  },
  {
    name: 'min',
    type: 'number',
    default: '0',
    description: 'Minimum selectable value.',
  },
  {
    name: 'max',
    type: 'number',
    default: '100',
    description: 'Maximum selectable value.',
  },
  {
    name: 'step',
    type: 'number',
    default: '1',
    description: 'Granularity between selectable values.',
  },
  {
    name: 'onChange',
    type: '(value: number) => void',
    description: 'Called with the new value as the user drags the thumb.',
  },
]

const usageCode = `import { useState } from 'react'

export function BrightnessControl() {
  const [value, setValue] = useState(40)

  return (
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => setValue(Number(e.target.value))}
      aria-label="Brightness"
      className="h-2 w-full appearance-none rounded-full bg-muted accent-primary"
    />
  )
}`

export default function SliderPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Slider</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A control for selecting a numeric value from a continuous range. The styled component is in
          development; the package currently ships the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">SliderProps</code>{' '}
          contract, and the previews below use a native range input to illustrate the intended API.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Default</h2>
        <p className="text-sm text-muted-foreground">
          A controlled slider bound to React state.
        </p>
        <SliderExamples section="default" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-slider" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Stepped range</h2>
        <p className="text-sm text-muted-foreground">
          Use <code className="text-xs bg-muted px-1 rounded">step</code> to snap the value to discrete increments.
        </p>
        <SliderExamples section="range" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={sliderProps} />
      </section>
    </div>
  )
}
