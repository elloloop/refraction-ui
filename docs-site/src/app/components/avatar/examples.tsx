'use client'

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  type AvatarSize,
  type PresenceStatus,
} from '@refraction-ui/react-avatar'

interface AvatarExamplesProps {
  section: 'sizes' | 'fallback' | 'presence'
}

const PEOPLE: { name: string; initials: string; presence: PresenceStatus; status: string }[] = [
  { name: 'Ada Lovelace', initials: 'AL', presence: 'online', status: 'Online' },
  { name: 'Grace Hopper', initials: 'GH', presence: 'away', status: 'Away' },
  { name: 'Alan Turing', initials: 'AT', presence: 'busy', status: 'Busy' },
  { name: 'Katherine Johnson', initials: 'KJ', presence: 'dnd', status: 'Do Not Disturb' },
  { name: 'Edsger Dijkstra', initials: 'ED', presence: 'offline', status: 'Offline' },
]

const SIZES: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

function PresenceExample() {
  return (
    <div
      data-testid="avatar-presence-example"
      className="rounded-xl border border-border bg-card p-8 space-y-8"
    >
      <div className="flex flex-wrap items-end gap-6">
        {PEOPLE.map((person) => (
          <div key={person.name} className="flex flex-col items-center gap-2.5">
            <Avatar size="lg" aria-label={person.name} presence={person.presence}>
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">{person.status}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-6">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-col items-center gap-2.5">
            <Avatar size={size} aria-label={`Ada Lovelace, ${size}`} presence="online">
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">{size}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2.5">
          <Avatar size="lg" shape="square" aria-label="Design team" presence="away">
            <AvatarFallback>DT</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground font-medium">square</span>
        </div>
      </div>
    </div>
  )
}

export function AvatarExamples({ section }: AvatarExamplesProps) {
  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="xs">
              <AvatarFallback>XS</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">xs</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="sm">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="md">
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">md</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="lg">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">lg</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="xl">
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">xl</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'fallback') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="lg">
              <AvatarImage src="https://i.pravatar.cc/150?u=a" alt="User avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">With Image</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="lg">
              <AvatarImage src="/broken-image.jpg" alt="Broken" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">Fallback Initials</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Avatar size="lg">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">Initials Only</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'presence') return <PresenceExample />

  return null
}
