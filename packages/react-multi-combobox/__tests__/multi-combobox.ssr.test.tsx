import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { MultiCombobox, type MultiComboboxOption } from '../src/index.js'

const people: MultiComboboxOption[] = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'alan', label: 'Alan Turing' },
  { value: 'grace', label: 'Grace Hopper' },
]

function html(ui: React.ReactElement): string {
  return renderToString(ui)
}

function attr(markup: string, selector: RegExp): string | undefined {
  return markup.match(selector)?.[1]
}

describe('MultiCombobox (SSR)', () => {
  it('renders an ARIA 1.2 combobox input controlling a multi-selectable listbox', () => {
    const out = html(<MultiCombobox options={people} aria-label="Invite people" />)
    expect(out).toContain('role="combobox"')
    expect(out).toContain('aria-autocomplete="list"')
    expect(out).toContain('aria-haspopup="listbox"')
    expect(out).toContain('aria-expanded="false"')
    expect(out).toContain('role="listbox"')
    expect(out).toContain('aria-multiselectable="true"')

    const controls = attr(out, /aria-controls="([^"]+)"/)
    const listboxId = attr(out, /role="listbox" id="([^"]+)"/)
    expect(controls).toBeDefined()
    expect(controls).toBe(listboxId)
  })

  it('names the input and listbox from aria-label', () => {
    const out = html(<MultiCombobox options={people} aria-label="Invite people" />)
    expect(out.match(/aria-label="Invite people"/g)).toHaveLength(2)
  })

  it('supports aria-labelledby and a custom inputId for <label htmlFor>', () => {
    const out = html(
      <MultiCombobox options={people} aria-labelledby="who" inputId="invitees" />,
    )
    expect(out).toContain('id="invitees"')
    expect(out.match(/aria-labelledby="who"/g)).toHaveLength(2)
  })

  it('renders no active descendant and no options while closed', () => {
    const out = html(<MultiCombobox options={people} aria-label="People" />)
    expect(out).not.toContain('aria-activedescendant')
    expect(out).not.toContain('role="option"')
    expect(out).toContain('data-state="closed"')
    expect(out).toMatch(/<div[^>]*hidden=""[^>]*>/)
  })

  it('renders selected values as chips with accessible remove buttons', () => {
    const out = html(
      <MultiCombobox options={people} defaultValue={[people[0], people[2]]} aria-label="People" />,
    )
    expect(out).toContain('aria-label="Selected"')
    expect(out).toContain('Ada Lovelace')
    expect(out).toContain('Grace Hopper')
    expect(out).toContain('aria-label="Remove Ada Lovelace"')
    expect(out).toContain('aria-label="Remove Grace Hopper"')
    expect(out.match(/<button/g)).toHaveLength(2)
  })

  it('omits the chip list when nothing is selected', () => {
    const out = html(<MultiCombobox options={people} aria-label="People" />)
    expect(out).not.toContain('aria-label="Selected"')
  })

  it('remove buttons carry a focus ring and a 44px extended hit area', () => {
    const out = html(<MultiCombobox options={people} value={[people[0]]} aria-label="People" />)
    expect(out).toContain('focus-visible:ring-2')
    expect(out).toContain('before:-inset-3')
  })

  it('has a polite live region for announcements', () => {
    const out = html(<MultiCombobox options={people} aria-label="People" />)
    expect(out).toContain('role="status"')
    expect(out).toContain('aria-live="polite"')
    expect(out).toContain('sr-only')
  })

  it('renders one hidden input per selected value when named', () => {
    const out = html(
      <MultiCombobox options={people} value={[people[0], people[1]]} name="invitees" aria-label="People" />,
    )
    expect(out.match(/type="hidden" name="invitees"/g)).toHaveLength(2)
    expect(out).toContain('value="ada"')
    expect(out).toContain('value="alan"')
  })

  it('disables the input and remove buttons when disabled', () => {
    const out = html(
      <MultiCombobox options={people} value={[people[0]]} disabled aria-label="People" />,
    )
    expect(out).toContain('data-disabled=""')
    expect(out.match(/disabled=""/g)?.length).toBeGreaterThanOrEqual(2)
    expect(out).toContain('cursor-not-allowed')
  })

  it('marks the listbox busy while loading', () => {
    const out = html(<MultiCombobox options={[]} loading aria-label="People" />)
    expect(out).toContain('aria-busy="true"')
    expect(out).toContain('data-loading=""')
  })

  it('shows the placeholder and forwards className and root attributes', () => {
    const out = html(
      <MultiCombobox
        options={people}
        placeholder="Add people…"
        className="custom-root"
        data-testid="mc"
        aria-label="People"
      />,
    )
    expect(out).toContain('placeholder="Add people…"')
    expect(out).toContain('custom-root')
    expect(out).toContain('data-testid="mc"')
  })

  it('uses custom messages for remove labels', () => {
    const out = html(
      <MultiCombobox
        options={people}
        value={[people[0]]}
        messages={{ remove: (label) => `Quitar ${label}` }}
        aria-label="People"
      />,
    )
    expect(out).toContain('aria-label="Quitar Ada Lovelace"')
  })
})
