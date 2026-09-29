// @vitest-environment jsdom
import { it, expect, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot, type Root } from 'react-dom/client'
import { resetIdCounter } from '@refraction-ui/shared'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../src/dropdown-menu.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

function Example() {
  return <DropdownMenu>
    <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
    <DropdownMenuContent><DropdownMenuItem>Profile</DropdownMenuItem></DropdownMenuContent>
  </DropdownMenu>
}

it('hydrates independent menus after earlier server requests and links each trigger to its portal', async () => {
  resetIdCounter()
  renderToString(<Example />) // The server has handled an earlier request.
  const ui = <><Example /><Example /></>
  const container = document.createElement('div')
  container.innerHTML = renderToString(ui)
  document.body.appendChild(container)
  const triggers = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
  const serverIds = triggers.map(trigger => trigger.getAttribute('aria-controls'))
  expect(new Set(serverIds).size).toBe(2)
  resetIdCounter() // Fresh client module; do not share the server's counter.
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  const recoverable: unknown[] = []
  let root: Root | undefined
  try {
    await act(async () => { root = hydrateRoot(container, ui, { onRecoverableError: error => recoverable.push(error) }) })
    expect(errors.mock.calls).toEqual([])
    expect(recoverable).toEqual([])
    expect(Array.from(container.querySelectorAll('button'))).toEqual(triggers)
    expect(triggers.map(trigger => trigger.getAttribute('aria-controls'))).toEqual(serverIds)
    for (const trigger of triggers) {
      await act(async () => { trigger.click() })
      const menu = document.getElementById(trigger.getAttribute('aria-controls')!)
      expect(menu?.getAttribute('role')).toBe('menu')
      expect(menu?.textContent).toBe('Profile')
      await act(async () => { trigger.click() })
      expect(document.querySelector('[role="menu"]')).toBeNull()
    }
  } finally {
    if (root) await act(async () => { root!.unmount() })
    container.remove()
    errors.mockRestore()
  }
})
