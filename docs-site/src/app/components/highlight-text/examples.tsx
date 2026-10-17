'use client'

import * as React from 'react'
import { HighlightText, splitHighlightQuery } from '@refraction-ui/react-highlight-text'

export type HighlightTextExampleSection =
  | 'search'
  | 'diacritics'
  | 'whole-word'
  | 'ranges'

interface HighlightTextExamplesProps {
  section: HighlightTextExampleSection
}

const frame = 'rounded-xl border border-border bg-card p-8'
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const COMMANDS = [
  'Create new file',
  'Open recent project',
  'Close window',
  'Crème brûlée recipe',
  'Toggle dark theme',
  'Reopen closed editor',
]

export function HighlightTextExamples({ section }: HighlightTextExamplesProps) {
  if (section === 'search') return <SearchExample />

  if (section === 'diacritics') {
    return (
      <dl className={`${frame} grid gap-3 text-sm text-foreground sm:grid-cols-[auto_1fr]`}>
        <dt className="text-muted-foreground">query “creme” (default)</dt>
        <dd>
          <HighlightText text="Crème brûlée, crème fraîche" query="creme" />
        </dd>
        <dt className="text-muted-foreground">query “creme”, diacriticSensitive</dt>
        <dd>
          <HighlightText text="Crème brûlée, creme fraiche" query="creme" diacriticSensitive />
        </dd>
        <dt className="text-muted-foreground">query “CREME”, caseSensitive</dt>
        <dd>
          <HighlightText text="CRÈME brûlée, crème fraîche" query="CREME" caseSensitive />
        </dd>
      </dl>
    )
  }

  if (section === 'whole-word') {
    return (
      <dl className={`${frame} grid gap-3 text-sm text-foreground sm:grid-cols-[auto_1fr]`}>
        <dt className="text-muted-foreground">query “cat”</dt>
        <dd>
          <HighlightText text="The cat sat on a concatenated catalogue." query="cat" />
        </dd>
        <dt className="text-muted-foreground">query “cat”, wholeWord</dt>
        <dd>
          <HighlightText text="The cat sat on a concatenated catalogue." query="cat" wholeWord />
        </dd>
      </dl>
    )
  }

  if (section === 'ranges') {
    // e.g. the character positions a fuzzy scorer matched for the input "cmdp".
    return (
      <div className={`${frame} text-sm text-foreground`}>
        <HighlightText
          text="Command palette"
          ranges={[
            { start: 0, end: 1 },
            { start: 2, end: 3 },
            { start: 6, end: 7 },
            { start: 8, end: 9 },
          ]}
        />
      </div>
    )
  }

  return null
}

function SearchExample() {
  const inputId = React.useId()
  const [query, setQuery] = React.useState('re')
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [wholeWord, setWholeWord] = React.useState(false)
  const terms = React.useMemo(() => splitHighlightQuery(query), [query])

  return (
    <div className={`${frame} space-y-4`}>
      <div className="space-y-2">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          Search commands
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={`block h-11 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground ${focusRing}`}
          placeholder="Type to highlight, e.g. “new file”"
        />
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-foreground">
        <label className="inline-flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(event) => setCaseSensitive(event.target.checked)}
            className={`size-4 accent-primary ${focusRing}`}
          />
          Case-sensitive
        </label>
        <label className="inline-flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={wholeWord}
            onChange={(event) => setWholeWord(event.target.checked)}
            className={`size-4 accent-primary ${focusRing}`}
          />
          Whole word
        </label>
      </div>
      <ul className="divide-y divide-border rounded-md border border-border text-sm text-foreground">
        {COMMANDS.map((command) => (
          <li key={command} className="px-3 py-2">
            <HighlightText
              text={command}
              query={terms}
              caseSensitive={caseSensitive}
              wholeWord={wholeWord}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
