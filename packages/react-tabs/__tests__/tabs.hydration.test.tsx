// @vitest-environment jsdom
import { it, expect, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot, type Root } from 'react-dom/client'
import { resetIdCounter } from '@refraction-ui/shared'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../src/tabs.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

function Example() {
  return <Tabs defaultValue="first">
    <TabsList><TabsTrigger value="first">First</TabsTrigger><TabsTrigger value="second">Second</TabsTrigger></TabsList>
    <TabsContent value="first">First panel</TabsContent>
    <TabsContent value="second">Second panel</TabsContent>
  </Tabs>
}

it('hydrates independent tab sets after earlier server requests without changing ARIA identities', async () => {
  resetIdCounter()
  renderToString(<Example />) // A long-lived server has rendered another request.
  const ui = <><Example /><Example /></>
  const container = document.createElement('div')
  container.innerHTML = renderToString(ui)
  document.body.appendChild(container)
  const serverTabs = Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]'))
  const serverIds = serverTabs.map(tab => tab.id)
  expect(new Set(serverIds).size).toBe(4)
  resetIdCounter() // A fresh browser module starts independently of the server.
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  const recoverable: unknown[] = []
  let root: Root | undefined
  try {
    await act(async () => { root = hydrateRoot(container, ui, { onRecoverableError: error => recoverable.push(error) }) })
    expect(errors.mock.calls).toEqual([])
    expect(recoverable).toEqual([])
    expect(Array.from(container.querySelectorAll('[role="tab"]'))).toEqual(serverTabs)
    expect(serverTabs.map(tab => tab.id)).toEqual(serverIds)
    for (const index of [1, 3]) {
      await act(async () => { serverTabs[index].click() })
      const selected = serverTabs[index]
      const panel = document.getElementById(selected.getAttribute('aria-controls')!)
      expect(panel?.textContent).toBe('Second panel')
      expect(panel?.getAttribute('aria-labelledby')).toBe(selected.id)
    }
    expect(new Set(Array.from(container.querySelectorAll('[id]'), node => node.id)).size)
      .toBe(container.querySelectorAll('[id]').length)
  } finally {
    if (root) await act(async () => { root!.unmount() })
    container.remove()
    errors.mockRestore()
  }
})
