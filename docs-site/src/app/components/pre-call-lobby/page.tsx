import { PreCallLobbyExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const preCallLobbyProps = [
  {
    name: 'cameraOn',
    type: 'boolean',
    description: 'Whether the camera is currently enabled.',
  },
  {
    name: 'micOn',
    type: 'boolean',
    description: 'Whether the microphone is currently enabled.',
  },
  {
    name: 'onToggleCamera',
    type: '() => void',
    description: 'Called when the user clicks the camera toggle button.',
  },
  {
    name: 'onToggleMic',
    type: '() => void',
    description: 'Called when the user clicks the microphone toggle button.',
  },
  {
    name: 'micLevel',
    type: 'number',
    default: '0',
    description: 'Current microphone input level in the range [0, 1]. Drives the mic level meter.',
  },
  {
    name: 'cameras',
    type: 'MediaDeviceOption[]',
    default: '[]',
    description: 'List of available cameras `{ id, label }`. Renders a camera select when non-empty.',
  },
  {
    name: 'microphones',
    type: 'MediaDeviceOption[]',
    default: '[]',
    description: 'List of available microphones. Renders a mic select when non-empty.',
  },
  {
    name: 'speakers',
    type: 'MediaDeviceOption[]',
    default: '[]',
    description: 'List of available speakers. Renders a speaker select when non-empty.',
  },
  {
    name: 'selectedCamera',
    type: 'string',
    description: 'Controlled value for the camera select.',
  },
  {
    name: 'selectedMicrophone',
    type: 'string',
    description: 'Controlled value for the microphone select.',
  },
  {
    name: 'selectedSpeaker',
    type: 'string',
    description: 'Controlled value for the speaker select.',
  },
  {
    name: 'onDeviceChange',
    type: "(kind: 'camera' | 'microphone' | 'speaker', deviceId: string) => void",
    description: 'Called when the user picks a different device from any selector.',
  },
  {
    name: 'previewSlot',
    type: 'React.ReactNode',
    description: 'Node rendered inside the camera preview area when cameraOn is true (e.g. a <video> element).',
  },
  {
    name: 'joinLabel',
    type: 'string',
    default: "'Join'",
    description: 'Label text for the join button.',
  },
  {
    name: 'onJoin',
    type: '() => void',
    description: 'Called when the user clicks the join button.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the lobby card.',
  },
]

const usageCode = `import { PreCallLobby } from '@refraction-ui/react'

export function MeetingPreflight() {
  const [cameraOn, setCameraOn] = React.useState(true)
  const [micOn, setMicOn] = React.useState(true)

  return (
    <PreCallLobby
      cameraOn={cameraOn}
      micOn={micOn}
      onToggleCamera={() => setCameraOn(v => !v)}
      onToggleMic={() => setMicOn(v => !v)}
      micLevel={0.4}
      joinLabel="Join meeting"
      onJoin={() => router.push('/meeting')}
    />
  )
}`

export default function PreCallLobbyPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pre-Call Lobby</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A device-check panel displayed before joining a video meeting. Shows a
          camera preview, microphone level meter, optional device selectors for
          camera / mic / speaker, toggle controls, and a primary join CTA.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Camera on, mic on. Toggle each device with the icon buttons below the
          preview. Click Join to proceed.
        </p>
        <PreCallLobbyExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Camera off</h2>
        <p className="text-sm text-muted-foreground">
          When <code className="text-xs bg-muted px-1 rounded">cameraOn</code> is{' '}
          <code className="text-xs bg-muted px-1 rounded">false</code>, the preview
          area shows an avatar placeholder instead of the camera feed.
        </p>
        <PreCallLobbyExamples section="camera-off" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With device pickers</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">cameras</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">microphones</code>, and{' '}
          <code className="text-xs bg-muted px-1 rounded">speakers</code> arrays to
          show device selectors. Use{' '}
          <code className="text-xs bg-muted px-1 rounded">onDeviceChange</code> to
          handle switching.
        </p>
        <PreCallLobbyExamples section="with-devices" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation available via @refraction-ui/astro-pre-call-lobby -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={preCallLobbyProps} />
      </section>
    </div>
  )
}
