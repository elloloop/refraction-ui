// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { globalShortcutRegistry } from '@refraction-ui/keyboard-shortcut'
import { useShortcut, type UseShortcutOptions } from '../src/keyboard-shortcut.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let root: Root | undefined

function Registered(props: UseShortcutOptions) {
  useShortcut(props)
  return null
}

async function render(ui: React.ReactNode) {
  if (!root) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  }
  await act(async () => {
    root!.render(ui)
  })
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount())
  root = undefined
  document.body.replaceChildren()
})

describe('useShortcut registry listing', () => {
  it('registers an explicit description and group, and unregisters on unmount', async () => {
    await render(
      <Registered shortcut="Ctrl+B" description="Bold" group="Formatting" onTrigger={() => {}} />,
    )
    expect(globalShortcutRegistry.getSnapshot()).toEqual([
      { id: 'b+ctrl', keys: ['Ctrl', 'B'], description: 'Bold', group: 'Formatting' },
    ])
    await render(null)
    expect(globalShortcutRegistry.getSnapshot()).toEqual([])
  })

  it('falls back to the SANE_DEFAULTS description and group for an action', async () => {
    await render(<Registered action="save" onTrigger={() => {}} />)
    expect(globalShortcutRegistry.getSnapshot()).toEqual([
      { id: 'meta+s', keys: ['Meta', 's'], description: 'Save', group: 'General' },
    ])
  })

  it('lets an explicit description override the action default', async () => {
    await render(<Registered action="save" description="Save draft" onTrigger={() => {}} />)
    expect(globalShortcutRegistry.getSnapshot()[0]).toMatchObject({
      description: 'Save draft',
      group: 'General',
    })
  })

  it('re-lists a changed description without dropping the shortcut', async () => {
    const onTrigger = vi.fn()
    await render(<Registered shortcut="Ctrl+B" description="Bold" onTrigger={onTrigger} />)
    await render(<Registered shortcut="Ctrl+B" description="Toggle bold" onTrigger={onTrigger} />)
    expect(globalShortcutRegistry.getSnapshot()).toEqual([
      { id: 'b+ctrl', keys: ['Ctrl', 'B'], description: 'Toggle bold' },
    ])
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }))
    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it('does not list a disabled shortcut', async () => {
    await render(<Registered shortcut="Ctrl+B" description="Bold" enabled={false} onTrigger={() => {}} />)
    expect(globalShortcutRegistry.getSnapshot()).toEqual([])
  })

  it('keeps a second component’s registration when the first one unmounts', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await render(
      <>
        <Registered key="a" shortcut="Ctrl+K" description="Old search" onTrigger={() => {}} />
        <Registered key="b" shortcut="Ctrl+K" description="Search" onTrigger={() => {}} />
      </>,
    )
    await render(<Registered key="b" shortcut="Ctrl+K" description="Search" onTrigger={() => {}} />)
    expect(globalShortcutRegistry.getSnapshot()).toEqual([
      { id: 'ctrl+k', keys: ['Ctrl', 'K'], description: 'Search' },
    ])
    warn.mockRestore()
  })
})
