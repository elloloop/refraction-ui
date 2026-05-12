import { VoicePillExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
import { FrameworkTabs } from '@/components/framework-tabs'

const voicePillProps = [
  { name: 'speaker', type: "'ai' | 'user' | string", default: "'ai'", description: 'Speaker key used for defaults and data-speaker theming.' },
  { name: 'label', type: 'string', description: 'Primary speaker label announced by assistive technology.' },
  { name: 'sub', type: 'string', description: 'Optional subtitle, such as a listening state or partial transcript.' },
  { name: 'intensity', type: 'number', default: '0', description: 'Voice intensity from 0 to 1 used to scale pulse rings.' },
  { name: 'muted', type: 'boolean', default: 'false', description: 'Sets the mute toggle state.' },
  { name: 'onToggleMute', type: '() => void', description: 'Renders an accessible mute button when provided.' },
  { name: 'position', type: "'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end' | 'right-start' | 'right-center' | 'right-end'", default: "'bottom-center'", description: 'Fixed viewport placement with safe-area inset support.' },
  { name: 'avatar', type: 'ReactNode', description: 'Optional custom avatar content.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const frameworkPackages = {
  react: '@refraction-ui/react',
  astro: '@refraction-ui/astro',
  angular: '@refraction-ui/angular',
}

const reactUsageCode = `import { VoicePill } from '@refraction-ui/react'

export function InterviewOverlay({ intensity, muted, toggleMute }) {
  return (
    <VoicePill
      speaker="ai"
      label="Alex"
      sub="Listening..."
      intensity={intensity}
      muted={muted}
      onToggleMute={toggleMute}
      position="bottom-center"
    />
  )
}`

const astroUsageCode = `---
import { VoicePill } from '@refraction-ui/astro'
---

<VoicePill
  speaker="ai"
  label="Alex"
  sub="Listening..."
  intensity={0.85}
  position="bottom-center"
/>`

const angularUsageCode = `import { Component, signal } from '@angular/core'
import { RefractionVoicePillComponent } from '@refraction-ui/angular'

@Component({
  selector: 'app-interview-overlay',
  standalone: true,
  imports: [RefractionVoicePillComponent],
  template: \`
    <refraction-voice-pill
      speaker="ai"
      label="Alex"
      sub="Listening..."
      [intensity]="intensity()"
      [muted]="muted()"
      position="bottom-center"
      (muteToggle)="muted.set(!muted())"
    />
  \`,
})
export class InterviewOverlayComponent {
  intensity = signal(0.85)
  muted = signal(false)
}`

export default function VoicePillPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Voice Pill</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          Floating speaker indicator for voice-driven interfaces with intensity-aware pulse rings and a mute action.
          Exported from the single package for each framework: <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/react</code>, <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/astro</code>, and <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/angular</code>.
        </p>
      </div>

      <FrameworkTabs angularStatus={null} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <VoicePillExamples section="basic" />
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
        <PropsTable props={voicePillProps} />
      </section>
    </div>
  )
}
