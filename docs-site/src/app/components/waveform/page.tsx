import { WaveformExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
import { FrameworkTabs } from '@/components/framework-tabs'

const waveformProps = [
  { name: 'source', type: 'AnalyserNode | MediaStream | Float32Array | number[]', description: 'Live analyser, media stream, or sample data source.' },
  { name: 'samples', type: 'Float32Array | number[]', description: 'Precomputed samples for static or replay visualizations.' },
  { name: 'intensity', type: 'number', description: 'Cheap 0 to 1 input for animated bars or rings.' },
  { name: 'variant', type: "'bars' | 'line' | 'rings'", default: "'bars'", description: 'Visualization style.' },
  { name: 'height', type: 'number | string', default: '48', description: 'Canvas height in px or CSS length.' },
  { name: 'width', type: 'number | string', default: "'100%'", description: 'Canvas width in px or CSS length.' },
  { name: 'barCount', type: 'number', default: '32', description: 'Number of bars rendered by the bars variant.' },
  { name: 'smoothing', type: 'number', default: '0.8', description: 'Exponential smoothing factor from 0 to 1.' },
  { name: 'color', type: 'string', default: "'var(--accent-2)'", description: 'Canvas stroke or fill color.' },
  { name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation loop.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const frameworkPackages = {
  react: '@refraction-ui/react',
  astro: '@refraction-ui/astro',
  angular: '@refraction-ui/angular',
}

const reactUsageCode = `import { Waveform } from '@refraction-ui/react'

export function Recorder({ analyserNode }) {
  return (
    <Waveform
      source={analyserNode}
      height={48}
      variant="bars"
      barCount={40}
    />
  )
}`

const astroUsageCode = `---
import { Waveform } from '@refraction-ui/astro'
---

<Waveform
  intensity={0.85}
  height={48}
  variant="bars"
  barCount={40}
/>`

const angularUsageCode = `import { Component, signal } from '@angular/core'
import { RefractionWaveformComponent } from '@refraction-ui/angular'

@Component({
  selector: 'app-recorder',
  standalone: true,
  imports: [RefractionWaveformComponent],
  template: \`
    <refraction-waveform
      [intensity]="intensity()"
      [height]="48"
      variant="bars"
      [barCount]="40"
    />
  \`,
})
export class RecorderComponent {
  intensity = signal(0.85)
}`

export default function WaveformPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Waveform</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          Canvas audio visualization for live analyser nodes, sample arrays, media streams, and low-cost intensity values.
          Exported from the single package for each framework: <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/react</code>, <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/astro</code>, and <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/angular</code>.
        </p>
      </div>

      <FrameworkTabs angularStatus={null} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <WaveformExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={frameworkPackages} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: reactUsageCode, astro: astroUsageCode, angular: angularUsageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={waveformProps} />
      </section>
    </div>
  )
}
