'use client'
import { useState } from 'react'
import { AvatarGroup, type AvatarUser } from '@refraction-ui/react-avatar-group'
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@refraction-ui/react-dialog'
import { STATUS_LABELS } from '@refraction-ui/react-presence-indicator'

interface AvatarGroupExamplesProps { section: 'basic' | 'presence' }

/** Everyone in the conversation; Grace's photo is missing, so her initials stay. */
const PEOPLE: AvatarUser[] = [
  { id: '1', name: 'Ada Lovelace', src: 'https://i.pravatar.cc/150?u=a', status: 'online' },
  { id: '2', name: 'Grace Hopper', src: '/missing-avatar.png', status: 'away' },
  { id: '3', name: 'Alan Turing', status: 'busy' },
  { id: '4', name: 'Katherine Johnson', status: 'dnd' },
  { id: '5', name: 'Edsger Dijkstra', status: 'offline' },
  { id: '6', name: 'Barbara Liskov', status: 'online' },
]

function PresenceExample() {
  const [everyoneOpen, setEveryoneOpen] = useState(false)
  return (
    <div
      data-testid="avatar-group-presence-example"
      className="rounded-xl border border-border bg-card p-8 space-y-6"
    >
      <AvatarGroup users={PEOPLE} max={4} size="lg" onOverflowClick={() => setEveryoneOpen(true)} />
      <AvatarGroup users={PEOPLE} max={4} size="sm" onOverflowClick={() => setEveryoneOpen(true)} />
      <Dialog open={everyoneOpen} onOpenChange={setEveryoneOpen}>
        <DialogOverlay>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Everyone here ({PEOPLE.length})</DialogTitle>
            </DialogHeader>
            <ul className="space-y-2 text-sm">
              {PEOPLE.map((person) => (
                <li key={person.id} className="flex justify-between gap-4">
                  <span>{person.name}</span>
                  {person.status && (
                    <span className="text-muted-foreground">{STATUS_LABELS[person.status]}</span>
                  )}
                </li>
              ))}
            </ul>
            <DialogClose className="mt-4 inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
              Close
            </DialogClose>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </div>
  )
}

export function AvatarGroupExamples({ section }: AvatarGroupExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <AvatarGroup
          users={[
            { id: '1', name: 'Alice Johnson', src: 'https://i.pravatar.cc/150?u=a' },
            { id: '2', name: 'Bob Smith', src: 'https://i.pravatar.cc/150?u=b' },
            { id: '3', name: 'Carol White', src: 'https://i.pravatar.cc/150?u=c' },
            { id: '4', name: 'Dave Brown' },
            { id: '5', name: 'Eve Davis' },
          ]}
          max={4}
          size="md"
        />
      </div>
    )
  }
  if (section === 'presence') return <PresenceExample />
  return null
}
