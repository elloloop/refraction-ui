import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { CommandDialog, type CommandDialogGroupData, type CommandDialogProps } from '../src/index.js'

const groups: CommandDialogGroupData[] = [
  {
    id: 'files',
    heading: 'Files',
    scope: 'files',
    items: [{ id: 'roadmap', label: 'Roadmap.pdf', description: 'Shared by Ada' }],
  },
  {
    id: 'people',
    heading: 'People',
    scope: 'people',
    items: [
      { id: 'ada', label: 'Ada Lovelace', icon: <span>AL</span> },
      { id: 'alan', label: 'Alan Turing', disabled: true },
    ],
  },
]

const filters = [
  { id: 'people', label: 'People' },
  { id: 'files', label: 'Files' },
]

function render(props: Partial<CommandDialogProps> = {}) {
  return renderToString(<CommandDialog defaultOpen {...props} />)
}

/** Text content of the HTML in order, tags stripped. */
function text(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/<!-- -->/g, '')
}

describe('CommandDialog (SSR)', () => {
  it('renders nothing while closed', () => {
    expect(renderToString(<CommandDialog groups={groups} />)).not.toContain('role="dialog"')
  })

  it('is a modal dialog named by a visually hidden title', () => {
    const html = render({ title: 'Search workspace' })
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    const titleId = /<h2[^>]*id="([^"]+)"/.exec(html)?.[1]
    expect(titleId).toBeTruthy()
    expect(html).toContain(`aria-labelledby="${titleId}"`)
    expect(html).toMatch(/<h2[^>]*class="[^"]*sr-only/)
  })

  it('composes Command: a labelled searchbox controlling a listbox', () => {
    const html = render({ title: 'Search workspace', placeholder: 'Find…' })
    expect(html).toContain('role="searchbox"')
    expect(html).toContain('aria-label="Search workspace"')
    expect(html).toContain('placeholder="Find…"')
    const controls = /role="searchbox"[^>]*aria-controls="([^"]+)"/.exec(html)?.[1]
    expect(controls).toBeTruthy()
    expect(html).toContain(`id="${controls}" role="listbox"`)
  })

  it('renders groups in groupOrder as labelled groups of options', () => {
    const html = render({ groups, groupOrder: ['people', 'files'] })
    expect(html).toContain('role="group" aria-label="People"')
    expect(html.indexOf('aria-label="People"')).toBeLessThan(html.indexOf('aria-label="Files"'))
    expect(html.match(/role="option"/g)).toHaveLength(3)
    expect(text(html)).toContain('Shared by Ada')
  })

  it('marks disabled items and hides decorative icons', () => {
    const html = render({ groups })
    expect(html).toMatch(/aria-disabled="true"[^>]*data-value="alan"/)
    expect(html).toMatch(/<span aria-hidden="true"[^>]*><span>AL<\/span><\/span>/)
  })

  it('shows recents first, under their heading, without repeating them below', () => {
    const html = render({
      groups,
      defaultRecentItems: [{ id: 'ada', label: 'Ada Lovelace', scope: 'people' }],
      recentHeading: 'Recently opened',
    })
    expect(html.indexOf('Recently opened')).toBeLessThan(html.indexOf('aria-label="Files"'))
    expect(html.match(/data-value="ada"/g)).toHaveLength(1)
  })

  it('renders filter chips as a radiogroup with "All" first and a roving tab stop', () => {
    const html = render({ groups, filters, filtersLabel: 'Scope' })
    expect(html).toContain('role="radiogroup" aria-label="Scope"')
    const radios = [...html.matchAll(/<button[^>]*role="radio"[^>]*>/g)].map((m) => m[0])
    expect(radios).toHaveLength(3)
    expect(radios[0]).toContain('data-filter="all"')
    expect(radios[0]).toContain('aria-checked="true"')
    expect(radios[0]).toContain('tabindex="0"')
    expect(radios[1]).toContain('aria-checked="false"')
    expect(radios[1]).toContain('tabindex="-1"')
    expect(radios[0]).toContain('focus-visible:ring-2')
  })

  it('omits the chip group when there are no filters', () => {
    expect(render({ groups })).not.toContain('role="radiogroup"')
  })

  it('scopes results to the active chip', () => {
    const html = render({ groups, filters, defaultActiveFilter: 'files' })
    expect(html).toMatch(/aria-checked="true"[^>]*data-filter="files"/)
    expect(html).toContain('data-value="roadmap"')
    expect(html).not.toContain('data-value="ada"')
  })

  it('falls back to All for an unknown active chip', () => {
    const html = render({ groups, filters, activeFilter: 'gone' })
    expect(html).toMatch(/aria-checked="true"[^>]*data-filter="all"/)
  })

  it('announces loading in a status region and marks the list busy', () => {
    const html = render({ loading: true, loadingLabel: 'Fetching…', emptyLabel: 'Nothing' })
    expect(html).toMatch(/role="status" aria-live="polite"[^>]*>.*Fetching…/)
    expect(html).toContain('aria-busy="true"')
    expect(text(html)).not.toContain('Nothing')
    expect(html).toContain('motion-reduce:animate-none')
  })

  it('keeps an empty status region and shows the empty label when idle with no results', () => {
    const html = render({ emptyLabel: 'Nothing here' })
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-busy="false"')
    expect(text(html)).toContain('Nothing here')
  })

  it('applies className and the reduced-motion override to the panel', () => {
    const html = render({ className: 'custom-panel' })
    expect(html).toMatch(/role="dialog"[^>]*class="[^"]*custom-panel/)
    expect(html).toMatch(/class="[^"]*motion-reduce:transition-none[^"]*"/)
  })
})
