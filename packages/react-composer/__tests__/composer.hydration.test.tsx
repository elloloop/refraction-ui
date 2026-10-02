// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot, type Root } from 'react-dom/client'
import { RefractionComposer } from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

describe('composer hydration', () => {
  it('keeps implicit IDs and newly opened accessory links stable in Strict Mode', async () => {
    const ui = (
      <React.StrictMode>
        <RefractionComposer defaultValue="First draft" accessoryPanel={<span>First panel</span>} />
        <RefractionComposer defaultValue="Second draft" accessoryPanel={<span>Second panel</span>} />
        <RefractionComposer id="host-composer" accessoryPanel={<span>Host panel</span>} />
      </React.StrictMode>
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(ui)
    document.body.appendChild(container)
    const serverIDs = Array.from(container.querySelectorAll('[role="form"]'), element => element.id)
    expect(new Set(serverIDs).size).toBe(3)
    expect(serverIDs[2]).toBe('host-composer')
    // Another server render must not affect the client's hydration identity.
    renderToString(<RefractionComposer />)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    let root: Root | undefined
    try {
      await act(async () => { root = hydrateRoot(container, ui) })
      expect(Array.from(container.querySelectorAll('[role="form"]'), element => element.id)).toEqual(serverIDs)
      const toggles = container.querySelectorAll<HTMLButtonElement>('button[aria-label="Emoji and stickers"]')
      expect(toggles).toHaveLength(3)
      for (const toggle of toggles) {
        const controlledID = toggle.getAttribute('aria-controls')
        await act(async () => { toggle.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
        expect(toggle.getAttribute('aria-expanded')).toBe('true')
        expect(document.getElementById(controlledID!)).not.toBeNull()
      }
      expect(consoleError).not.toHaveBeenCalled()
    } finally {
      if (root) await act(async () => { root!.unmount() })
      consoleError.mockRestore()
      container.remove()
    }
  })
})
