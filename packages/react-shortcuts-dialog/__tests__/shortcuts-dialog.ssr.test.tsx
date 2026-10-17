import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import type { RegisteredShortcut } from '@refraction-ui/keyboard-shortcut'
import { ShortcutsDialog, type ShortcutsDialogProps } from '../src/index.js'

function staticRegistry(entries: RegisteredShortcut[]) {
  const getSnapshot = () => entries
  return { subscribe: () => () => {}, getSnapshot, getServerSnapshot: getSnapshot }
}

const REGISTERED: RegisteredShortcut[] = [
  { id: 'k+meta', keys: ['Meta', 'k'], description: 'Search', group: 'Navigation' },
  { id: 'meta+z', keys: ['Meta', 'z'], description: 'Undo', group: 'Editing' },
]

function render(props: Partial<ShortcutsDialogProps> = {}) {
  return renderToString(
    <ShortcutsDialog defaultOpen platform="mac" registry={staticRegistry([])} {...props} />,
  )
}

describe('ShortcutsDialog (SSR)', () => {
  it('renders nothing but the trigger while closed', () => {
    const html = renderToString(
      <ShortcutsDialog platform="mac" trigger={<button>Shortcuts</button>} />,
    )
    expect(html).not.toContain('role="dialog"')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('>Shortcuts</button>')
  })

  it('renders a modal dialog named by its title and description', () => {
    const html = render()
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(html)?.[1]
    const describedBy = /aria-describedby="([^"]+)"/.exec(html)?.[1]
    expect(labelledBy).toBeTruthy()
    expect(describedBy).toBeTruthy()
    expect(html).toContain(`id="${labelledBy}"`)
    expect(html).toContain('>Keyboard shortcuts</h2>')
    expect(html).toContain(`id="${describedBy}"`)
  })

  it('renders a labelled search field that controls the list', () => {
    const html = render()
    expect(html).toContain('type="search"')
    expect(html).toContain('aria-label="Search shortcuts"')
    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1]
    expect(html).toContain(`id="${controls}"`)
  })

  it('announces the result count in a polite live region', () => {
    const html = render({ shortcuts: [{ keys: ['g', 'i'], description: 'Go to inbox' }] })
    // Go to inbox + the dialog's own "Show keyboard shortcuts" row.
    expect(html).toMatch(/role="status" aria-live="polite"[^>]*>2 shortcuts</)
  })

  it('lists registered shortcuts in labelled group sections', () => {
    const html = render({ registry: staticRegistry(REGISTERED) })
    const headings = Array.from(html.matchAll(/<h3 id="([^"]+)"[^>]*>([^<]+)<\/h3>/g))
    expect(headings.map((m) => m[2])).toEqual(['General', 'Editing', 'Navigation'])
    for (const [, id] of headings) expect(html).toContain(`aria-labelledby="${id}"`)
    expect(html).toContain('>Search</span>')
    expect(html).toContain('>Undo</span>')
  })

  it('prints platform keycaps and reads each row’s keys as one phrase', () => {
    const html = render({ registry: staticRegistry(REGISTERED) })
    expect(html).toContain('<kbd')
    expect(html).toContain('⌘')
    expect(html).toContain('>Command + K</span>')
    // The dialog's own row merges ⌘/ and ? into one phrase.
    expect(html).toContain('>Command + / or ?</span>')
  })

  it('prints Windows legends for platform="windows"', () => {
    const html = render({ platform: 'windows' })
    expect(html).toContain('>Ctrl + / or ?</span>')
    expect(html).not.toContain('⌘')
  })

  it('hides the decorative keycaps from assistive tech', () => {
    const html = render()
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*"><span class="[^"]*" data-combo=/)
  })

  it('omits the open shortcuts when openShortcut is false', () => {
    const html = render({ openShortcut: false, shortcuts: [{ keys: ['j'], description: 'Next' }] })
    expect(html).not.toContain('Show keyboard shortcuts')
    expect(html).toContain('>1 shortcut<')
  })

  it('lists every SANE_DEFAULTS action with includeDefaults', () => {
    const html = render({ includeDefaults: true })
    expect(html).toContain('>Clipboard</h3>')
    expect(html).toContain('>Paste</span>')
    expect(html).toContain('>Redo</span>')
  })

  it('renders an icon-only close button with an accessible name and a 44px hit area', () => {
    const html = render()
    const close = /<button[^>]*aria-label="Close"[^>]*>/.exec(html)?.[0] ?? ''
    expect(close).toContain('type="button"')
    expect(close).toContain('h-11 w-11')
    expect(close).toContain('focus-visible:ring-2')
    expect(html).toMatch(/<svg aria-hidden="true"/)
  })

  it('shows the empty message when there is nothing to list', () => {
    const html = render({ openShortcut: false })
    expect(html).toContain('No shortcuts match your search.')
    expect(html).toContain('>0 shortcuts<')
  })

  it('uses localised labels', () => {
    const html = render({
      labels: { title: 'Tastenkürzel', alternative: 'oder', openShortcut: 'Hilfe', searchLabel: 'Suchen' },
    })
    expect(html).toContain('>Tastenkürzel</h2>')
    expect(html).toContain('>Command + / oder ?</span>')
    expect(html).toContain('>Hilfe</span>')
    expect(html).toContain('aria-label="Suchen"')
  })

  it('forwards className, data attributes and the platform', () => {
    const html = render({ className: 'my-help', id: 'help' } as Partial<ShortcutsDialogProps>)
    expect(html).toContain('my-help')
    expect(html).toContain('id="help"')
    expect(html).toContain('data-platform="mac"')
  })

  it('lists nothing from a registry without a server snapshot (useShortcut registers in effects)', () => {
    const registry = { subscribe: () => () => {}, getSnapshot: () => REGISTERED }
    const html = render({ registry, openShortcut: false })
    expect(html).toContain('>0 shortcuts<')
  })

  it('lists nothing from the live registry on the server (useShortcut registers in effects)', () => {
    const html = renderToString(<ShortcutsDialog defaultOpen platform="mac" openShortcut={false} />)
    expect(html).toContain('>0 shortcuts<')
  })
})
