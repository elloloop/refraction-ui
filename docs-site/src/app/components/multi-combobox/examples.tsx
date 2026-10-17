'use client'

import * as React from 'react'
import { MultiCombobox, type MultiComboboxOption } from '@refraction-ui/react-multi-combobox'
import { Avatar, AvatarFallback, getInitials } from '@refraction-ui/react-avatar'

interface Person extends MultiComboboxOption {
  email: string
}

const PEOPLE: Person[] = [
  { value: 'ada', label: 'Ada Lovelace', email: 'ada@example.com' },
  { value: 'alan', label: 'Alan Turing', email: 'alan@example.com' },
  { value: 'grace', label: 'Grace Hopper', email: 'grace@example.com' },
  { value: 'katherine', label: 'Katherine Johnson', email: 'katherine@example.com' },
  { value: 'margaret', label: 'Margaret Hamilton', email: 'margaret@example.com' },
  { value: 'linus', label: 'Linus Torvalds', email: 'linus@example.com', disabled: true },
  { value: 'barbara', label: 'Barbara Liskov', email: 'barbara@example.com' },
]

/** Simulated network latency for the async example. */
const SEARCH_DELAY_MS = 400
const MAX_INVITEES = 3

const TAGS: MultiComboboxOption[] = [
  { value: 'design', label: 'design' },
  { value: 'frontend', label: 'frontend' },
  { value: 'urgent', label: 'urgent' },
]

function PersonAvatar({ person }: { person: Person }) {
  return (
    <Avatar size="xs">
      <AvatarFallback>{getInitials(person.label)}</AvatarFallback>
    </Avatar>
  )
}

/** Stand-in for a server search; the component never fetches by itself. */
function searchPeople(query: string): Promise<Person[]> {
  const needle = query.trim().toLowerCase()
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        PEOPLE.filter(
          (p) => p.label.toLowerCase().includes(needle) || p.email.includes(needle),
        ),
      )
    }, SEARCH_DELAY_MS)
  })
}

interface MultiComboboxExamplesProps {
  section: 'basic' | 'async' | 'creatable' | 'max' | 'controlled'
}

export function MultiComboboxExamples({ section }: MultiComboboxExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'async') return <AsyncExample />
  if (section === 'creatable') return <CreatableExample />
  if (section === 'max') return <MaxExample />
  if (section === 'controlled') return <ControlledExample />
  return null
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-8 pb-80">{children}</div>
}

function BasicExample() {
  return (
    <Frame>
      <label htmlFor="mc-basic" className="mb-2 block text-sm font-medium text-foreground">
        Invite people
      </label>
      <MultiCombobox
        inputId="mc-basic"
        options={PEOPLE}
        defaultValue={[PEOPLE[0]]}
        placeholder="Add people…"
        renderOptionLeading={(person) => <PersonAvatar person={person} />}
      />
    </Frame>
  )
}

function AsyncExample() {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<Person[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    searchPeople(query).then((found) => {
      if (cancelled) return
      setResults(found)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <Frame>
      <MultiCombobox
        aria-label="Search people by name or email"
        options={results}
        filter={false}
        loading={loading}
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name or email…"
        renderOptionLeading={(person) => <PersonAvatar person={person} />}
      />
    </Frame>
  )
}

function CreatableExample() {
  const [tags, setTags] = React.useState<MultiComboboxOption[]>(TAGS)
  return (
    <Frame>
      <MultiCombobox
        aria-label="Labels"
        options={tags}
        placeholder="Add a label…"
        onCreate={(query) => {
          const created = { value: query.toLowerCase(), label: query }
          setTags((current) => [...current, created])
          return created
        }}
      />
    </Frame>
  )
}

function MaxExample() {
  return (
    <Frame>
      <MultiCombobox
        aria-label={`Reviewers (up to ${MAX_INVITEES})`}
        options={PEOPLE}
        max={MAX_INVITEES}
        placeholder={`Pick up to ${MAX_INVITEES} reviewers…`}
        renderOptionLeading={(person) => <PersonAvatar person={person} />}
      />
    </Frame>
  )
}

function ControlledExample() {
  const [value, setValue] = React.useState<Person[]>([PEOPLE[1], PEOPLE[2]])
  return (
    <Frame>
      <div className="space-y-4">
        <MultiCombobox
          aria-label="Group members"
          options={PEOPLE}
          value={value}
          onValueChange={setValue}
          name="members"
          renderOptionLeading={(person) => <PersonAvatar person={person} />}
        />
        <p className="text-sm text-muted-foreground">
          {`Selected: ${value.map((p) => p.email).join(', ') || 'nobody'}`}
        </p>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setValue([])}
        >
          Clear all
        </button>
      </div>
    </Frame>
  )
}
