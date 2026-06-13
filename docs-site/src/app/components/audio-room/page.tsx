import { AudioRoomExamples, SpeakingOrbDemo } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const audioRoomProps = [
  {
    name: 'participants',
    type: 'AudioParticipant[]',
    description:
      'List of participants to render as speaking orbs. Each entry must have `id` and `name`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the grid container.',
  },
]

const speakingOrbProps = [
  {
    name: 'name',
    type: 'string',
    description:
      'Participant display name. Used for the initials fallback and `aria-label`.',
  },
  {
    name: 'avatarUrl',
    type: 'string',
    description: 'Avatar image URL. Falls back to initials when absent.',
  },
  {
    name: 'speaking',
    type: 'boolean',
    default: 'false',
    description: 'When true, an animated ring is shown around the orb.',
  },
  {
    name: 'muted',
    type: 'boolean',
    default: 'false',
    description: 'When true, the orb is dimmed and a muted badge is shown.',
  },
  {
    name: 'handRaised',
    type: 'boolean',
    default: 'false',
    description: 'When true, a raised-hand badge is shown at the top-right.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the orb element.',
  },
]

const audioParticipantType = `interface AudioParticipant {
  id: string
  name: string
  avatarUrl?: string
  speaking?: boolean
  muted?: boolean
  handRaised?: boolean
}`

const usageCode = `import { AudioRoom, SpeakingOrb } from '@refraction-ui/react'

const participants = [
  { id: '1', name: 'Alice Chen', speaking: true },
  { id: '2', name: 'Bob Smith', muted: true },
  { id: '3', name: 'Carol White', handRaised: true },
]

export function MyRoom() {
  return <AudioRoom participants={participants} aria-label="Audio room" />
}

// Or compose individual orbs:
export function MyOrb() {
  return <SpeakingOrb name="Alice Chen" speaking />
}`

export default function AudioRoomPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Audio Room</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An animated speaking-orb grid for audio-only meetings. Renders circular
          avatars (with initials fallback), a speaking ring, a muted badge, and a
          raised-hand badge. Column count adapts automatically to the number of
          participants.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic room</h2>
        <p className="text-sm text-muted-foreground">
          Pass a list of participants — each needs an <code className="text-xs bg-muted px-1 rounded">id</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">name</code>. The grid columns adapt from 1 → 2 → 3 → 4
          as participant count grows.
        </p>
        <AudioRoomExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Speaking + muted</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">speaking</code> to add an animated glow ring.
          Set <code className="text-xs bg-muted px-1 rounded">muted</code> to dim the orb and show a mic-off badge.
        </p>
        <AudioRoomExamples section="speaking-muted" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With raised hands</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">handRaised</code> to show a hand badge at the top-right
          of the orb. Variants can be combined (e.g. speaking + raised hand).
        </p>
        <AudioRoomExamples section="hand-raised" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">SpeakingOrb standalone</h2>
        <p className="text-sm text-muted-foreground">
          Use <code className="text-xs bg-muted px-1 rounded">SpeakingOrb</code> independently when you need
          a single orb outside a grid — in a sidebar participant list, for example.
        </p>
        <SpeakingOrbDemo />
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
        <h2 className="text-xl font-semibold tracking-tight text-foreground">AudioParticipant type</h2>
        <CodeBlock frameworks={{ react: audioParticipantType }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">AudioRoom props</h2>
        <PropsTable props={audioRoomProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">SpeakingOrb props</h2>
        <PropsTable props={speakingOrbProps} />
      </section>
    </div>
  )
}
